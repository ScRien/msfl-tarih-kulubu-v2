// routes/hesap.js
import express from "express";
import auth from "../middlewares/auth.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import cloudinary from "../helpers/cloudinary.js";
import Comment from "../models/Comment.js";
import { sendMail } from "../helpers/mail.js";
import { verificationMailTemplate } from "../helpers/mailTemplates.js";
import Backup from "../models/Backup.js";
import { sendDeletedMail } from "../mail/sendMail.js";
import bcrypt from "bcrypt";

const router = express.Router();

/* ============================================================
   HESAP SAYFASI (GET)
============================================================ */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    return res.render("pages/hesap", {
      user,
      success: req.query.success || null,
      error: req.query.error || null,
      showVerify: req.query.showVerify || null,
    });
  } catch (err) {
    console.log(err);
    return res.render("pages/hesap", { error: "Hesap yüklenemedi" });
  }
});

/* ============================================================
   PROFİL BİLGİLERİ GÜNCELLE
============================================================ */
router.post("/profil", auth, async (req, res) => {
  try {
    const { name, surname, email, bio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.redirect("/hesap?error=Kullanıcı+bulunamadı");
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (exists) {
        return res.redirect("/hesap?error=Bu+email+başka+bir+hesapta+kayıtlı");
      }
    }

    user.name = name;
    user.surname = surname;
    user.email = email;
    user.bio = bio?.trim() || "";

    await user.save();

    return res.redirect("/hesap?success=Profil+bilgileri+güncellendi");
  } catch (err) {
    console.log(err);
    return res.redirect("/hesap?error=Güncelleme+başarısız");
  }
});

/* ============================================================
   ÇEREZ AYARLARI
============================================================ */
router.post("/cookies", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.analyticsCookies = !!req.body.analyticsCookies;
    user.personalizationCookies = !!req.body.personalizationCookies;

    await user.save();

    return res.redirect("/hesap?success=Çerez+ayarları+güncellendi");
  } catch (err) {
    console.log(err);
    return res.redirect("/hesap?error=Çerez+ayarları+kaydedilemedi");
  }
});

/* ============================================================
   VERİ KULLANIMI
============================================================ */
router.post("/data-usage", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.serviceDataUsage = !!req.body.serviceDataUsage;
    user.personalizedContent = !!req.body.personalizedContent;

    await user.save();
    return res.redirect("/hesap?success=Veri+ayarları+güncellendi");
  } catch (err) {
    console.log(err);
    return res.redirect("/hesap?error=Veri+ayarları+kaydedilemedi");
  }
});

/* ============================================================
   AVATAR UPLOAD (CLIENT-SIDE URL)
============================================================ */
router.post("/avatar-yukle", auth, async (req, res) => {
  const { avatarUrl } = req.body;

  if (!avatarUrl) {
    return res.redirect("/hesap?error=Görsel+yüklenemedi");
  }

  await User.findByIdAndUpdate(req.user.id, {
    avatar: avatarUrl,
  });

  return res.redirect("/hesap?success=Avatar+güncellendi");
});

/* ============================================================
   COVER UPLOAD (CLIENT-SIDE URL)
============================================================ */
router.post("/kapak-yukle", auth, async (req, res) => {
  const { coverUrl } = req.body;

  if (!coverUrl) {
    return res.redirect("/hesap?error=Görsel+yüklenemedi");
  }

  await User.findByIdAndUpdate(req.user.id, {
    coverPhoto: coverUrl,
  });

  return res.redirect("/hesap?success=Kapak+fotoğrafı+güncellendi");
});

/* ============================================================
   SOSYAL MEDYA GÜNCELLE
============================================================ */
router.post("/social", auth, async (req, res) => {
  try {
    const { instagram, x, github } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      social: { instagram, x, github },
    });

    return res.redirect("/hesap?success=Sosyal+medya+güncellendi");
  } catch (err) {
    console.log(err);
    return res.redirect("/hesap?error=Güncellenemedi");
  }
});

/* ============================================================
   HESAP SİL
============================================================ */
router.post("/sil", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.render("pages/hesap", {
        error: "Hesap bulunamadı.",
      });
    }

    // ➤ Şifre kontrolü
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.render("pages/hesap", {
        error: "Şifre yanlış.",
      });
    }

    // ➤ Kullanıcı verilerini toplama
    const posts = await Post.find({ user_id: userId }).lean();
    const comments = await Comment.find({ user_id: userId }).lean();

    // ➤ Backup oluşturma
    await Backup.create({
      userId: user._id,
      username: user.username,
      email: user.email,
      ipHistory: [], // şu anlık boş kalsın dedin
      loginHistory: [],
      deviceInfo: [],
      userData: {
        profile: user.toObject(),
        posts,
        comments,
      },
    });

    // ➤ Post ve yorumları sil
    await Post.deleteMany({ user_id: userId });
    await Comment.deleteMany({ user_id: userId });

    // ➤ Kullanıcıyı sil
    await User.findByIdAndDelete(userId);

    // ➤ E-posta gönder
    await sendMail(
      user.email,
      "Hesabınız Silindi - MSFL Tarih Kulübü",
      accountDeletedMailTemplate(user.username)
    );

    // ➤ Cookie temizle
    res.clearCookie("token");

    return res.redirect("/?success=Hesabiniz+silindi");
  } catch (err) {
    console.error("HESAP SİLME HATASI:", err);
    return res.render("pages/hesap", {
      error: "Bir hata oluştu. Lütfen tekrar deneyin.",
    });
  }
});

/* ============================================================
   ŞİFRE DEĞİŞTİRME — KOD GÖNDER
============================================================ */
router.post("/sifre-kod", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.redirect("/hesap?error=Kullanıcı+bulunamadı");

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 1000 * 60 * 10);
    await user.save();

    const html = verificationMailTemplate(`${user.name} ${user.surname}`, code);
    const ok = await sendMail(user.email, "Doğrulama Kodunuz", html);

    if (!ok) {
      return res.redirect("/hesap?error=Mail+gönderilemedi");
    }

    return res.redirect(
      "/hesap?success=Doğrulama+kodu+gönderildi&showVerify=1"
    );
  } catch (err) {
    console.error(err);
    return res.redirect("/hesap?error=Beklenmeyen+hata");
  }
});

/* ============================================================
   ŞİFRE DEĞİŞTİRME — KOD DOĞRULA
============================================================ */
router.post("/sifre-kod-dogrula-form", auth, async (req, res) => {
  const { code } = req.body;

  const user = await User.findById(req.user.id);

  if (!user || !user.resetCode) {
    return res.redirect("/hesap?error=Kod+talep+edilmedi&showVerify=1");
  }

  if (user.resetCodeExpires < new Date()) {
    return res.redirect("/hesap?error=Kodun+süresi+doldu&showVerify=1");
  }

  if (code.trim() !== user.resetCode) {
    return res.redirect("/hesap?error=Kod+yanlış&showVerify=1");
  }

  return res.redirect("/hesap/sifre-yeni");
});

/* ============================================================
   ŞİFREYİ GERÇEKTEN DEĞİŞTİR
============================================================ */
router.post("/sifre-yeni", auth, async (req, res) => {
  try {
    const { password1, password2 } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || !user.resetCode) {
      return res.redirect("/hesap?error=Yetkisiz+işlem");
    }

    if (!password1 || !password2) {
      return res.redirect("/hesap/sifre-yeni?error=Şifreler+boş+olamaz");
    }

    if (password1 !== password2) {
      return res.redirect("/hesap/sifre-yeni?error=Şifreler+eşleşmiyor");
    }

    const bcrypt = await import("bcrypt");
    const hashed = await bcrypt.hash(password1, 10);

    user.password = hashed;
    user.resetCode = null;
    user.resetCodeExpires = null;

    await user.save();

    return res.redirect("/hesap?success=Şifre+başarıyla+değiştirildi");
  } catch (err) {
    console.log(err);
    return res.redirect("/hesap?error=Şifre+değiştirilemedi");
  }
});

export default router;
