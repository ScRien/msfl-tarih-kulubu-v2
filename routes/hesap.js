// routes/hesap.js
import express from "express";
import auth from "../middlewares/auth.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import cloudinary from "../helpers/cloudinary.js";
import Comment from "../models/Comment.js";
import { sendMail } from "../helpers/mail.js";
import {
  accountDeletedMailTemplate,
  verificationMailTemplate,
} from "../helpers/mailTemplates.js";
import Backup from "../models/Backup.js";
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
      showNewPasswordBox: req.query.showNewPasswordBox || false,
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

    if (!user) return res.redirect("/hesap?error=Kullanıcı+bulunamadı");

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
  } catch {
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
  } catch {
    return res.redirect("/hesap?error=Veri+ayarları+kaydedilemedi");
  }
});

/* ============================================================
   🔥 AVATAR YÜKLEME (Cloudinary public_id dahil)
============================================================ */
router.post("/avatar-yukle", auth, async (req, res) => {
  try {
    const { avatar, avatarPublicId } = req.body;

    if (!avatar) return res.redirect("/hesap?error=Avatar+yüklenemedi");

    const user = await User.findById(req.user.id);

    // eski avatar cloudinary'den sil
    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch {}
    }

    user.avatar = avatar;
    user.avatarPublicId = avatarPublicId || null;

    await user.save();
    return res.redirect("/hesap?success=Avatar+güncellendi");
  } catch (err) {
    console.error(err);
    return res.redirect("/hesap?error=Avatar+güncellenemedi");
  }
});

/* ============================================================
   🔥 KAPAK FOTO YÜKLEME (Cloudinary public_id dahil)
============================================================ */
router.post("/kapak-yukle", auth, async (req, res) => {
  try {
    const { coverPhoto, coverPublicId } = req.body;

    if (!coverPhoto) return res.redirect("/hesap?error=Kapak+yüklenemedi");

    const user = await User.findById(req.user.id);

    if (user.coverPublicId) {
      try {
        await cloudinary.uploader.destroy(user.coverPublicId);
      } catch {}
    }

    user.coverPhoto = coverPhoto;
    user.coverPublicId = coverPublicId || null;

    await user.save();
    return res.redirect("/hesap?success=Kapak+fotoğrafı+güncellendi");
  } catch (err) {
    console.error(err);
    return res.redirect("/hesap?error=Kapak+fotoğrafı+güncellenemedi");
  }
});

/* ============================================================
   SOSYAL MEDYA
============================================================ */
router.post("/social", auth, async (req, res) => {
  try {
    const { instagram, x, github } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      social: { instagram, x, github },
    });

    return res.redirect("/hesap?success=Sosyal+medya+güncellendi");
  } catch {
    return res.redirect("/hesap?error=Güncellenemedi");
  }
});

/* ============================================================
   HESAP SİLME
============================================================ */
router.post("/sil", auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    if (!password) return res.redirect("/hesap?error=Şifre+girilmedi");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.redirect("/hesap?error=Şifre+yanlış");

    const posts = await Post.find({ user_id: user._id }).lean();
    const comments = await Comment.find({ user_id: user._id }).lean();

    await Backup.create({
      userId: user._id,
      username: user.username,
      email: user.email,
      userData: { profile: user.toObject(), posts, comments },
    });

    await Post.deleteMany({ user_id: user._id });
    await Comment.deleteMany({ user_id: user._id });
    await User.findByIdAndDelete(user._id);

    await sendMail(
      user.email,
      "Hesabınız Silindi",
      accountDeletedMailTemplate(user.username)
    );

    res.clearCookie("auth_token");

    return res.redirect("/?success=Hesabınız+silindi");
  } catch (err) {
    console.error(err);
    return res.redirect("/hesap?error=Silinemedi");
  }
});

/* ============================================================
   ŞİFRE KODU GÖNDER
============================================================ */
router.post("/sifre-kod", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 10 * 60000);
    await user.save();

    const html = verificationMailTemplate(`${user.name} ${user.surname}`, code);
    await sendMail(user.email, "Doğrulama Kodunuz", html);

    return res.redirect("/hesap?success=Kod+gönderildi&showVerify=1");
  } catch {
    return res.redirect("/hesap?error=Kod+gönderilemedi");
  }
});

/* ============================================================
   KOD DOĞRULAMA
============================================================ */
router.post("/sifre-kod-dogrula-form", auth, async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user.id);

  if (!user || !user.resetCode)
    return res.redirect("/hesap?error=Kod+talep+edilmedi&showVerify=1");

  if (user.resetCodeExpires < new Date())
    return res.redirect("/hesap?error=Süre+doldu&showVerify=1");

  if (code.trim() !== user.resetCode)
    return res.redirect("/hesap?error=Kod+yanlış&showVerify=1");

  return res.redirect("/hesap/sifre-yeni");
});

/* ============================================================
   YENİ ŞİFRE OLUŞTURMA SAYFASI (GET)
============================================================ */
router.get("/sifre-yeni", auth, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  return res.render("pages/hesap", {
    user,
    showNewPasswordBox: true,
  });
});

/* ============================================================
   YENİ ŞİFRE KAYDET
============================================================ */
router.post("/sifre-yeni", auth, async (req, res) => {
  try {
    const { password1, password2 } = req.body;
    const user = await User.findById(req.user.id);

    if (!password1 || !password2)
      return res.redirect("/hesap?error=Şifre+boş+olamaz&showNewPasswordBox=1");

    if (password1 !== password2)
      return res.redirect(
        "/hesap?error=Şifreler+eşleşmiyor&showNewPasswordBox=1"
      );

    if (password1.length < 6)
      return res.redirect(
        "/hesap?error=Şifre+en+az+6+karakter+olmalı&showNewPasswordBox=1"
      );

    user.password = await bcrypt.hash(password1, 10);
    await user.save();

    return res.redirect("/hesap?success=Şifre+güncellendi");
  } catch {
    return res.redirect("/hesap?error=Bir+hata+oluştu&showNewPasswordBox=1");
  }
});

export default router;
