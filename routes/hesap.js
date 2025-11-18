import express from "express";
import auth from "../middlewares/auth.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import cloudinary from "../helpers/cloudinary.js";
import upload from "../middlewares/upload.js";
import Comment from "../models/Comment.js";
import { sendMail } from "../helpers/mail.js";
import { verificationMailTemplate } from "../helpers/mailTemplates.js";

const router = express.Router();

/* ============================================================
   HESAP SAYFASI (GET)
============================================================ */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    res.render("pages/hesap", {
      user,
      success: req.query.success || null,
      error: req.query.error || null,
      showVerify: req.query.showVerify || null,
    });
  } catch (err) {
    console.log(err);
    res.render("pages/hesap", { error: "Hesap yüklenemedi" });
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

    if (email !== user.email) {
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

    res.redirect("/hesap?success=Çerez+ayarları+güncellendi");
  } catch (err) {
    console.log(err);
    res.redirect("/hesap?error=Çerez+ayarları+kaydedilemedi");
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
    res.redirect("/hesap?success=Veri+ayarları+güncellendi");
  } catch (err) {
    console.log(err);
    res.redirect("/hesap?error=Veri+ayarları+kaydedilemedi");
  }
});

/* ============================================================
   AVATAR UPLOAD
============================================================ */
router.post(
  "/avatar-yukle",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.redirect("/hesap?error=Dosya+seçilmedi");
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "avatars",
          public_id: `avatar_${req.user.id}`,
          overwrite: true,
        });

        await User.findByIdAndUpdate(req.user.id, {
          avatar: uploadResult.secure_url,
        });

        return res.redirect("/hesap?success=Profil+fotoğrafı+güncellendi");
      } catch (err) {
        if (err.message.includes("File size too large")) {
          return res.redirect("/hesap?error=Görsel+10MB'den+küçük+olmalıdır");
        }

        console.error("Avatar upload error:", err);
        return res.redirect("/hesap?error=Avatar+yüklenemedi");
      }
    } catch (err) {
      console.log(err);
      return res.redirect("/hesap?error=Avatar+yüklenemedi");
    }
  }
);

/* ============================================================
   COVER UPLOAD
============================================================ */
router.post("/kapak-yukle", auth, upload.single("cover"), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect("/hesap?error=Dosya+seçilmedi");
    }

    try {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "covers",
        public_id: `cover_${req.user.id}`,
        overwrite: true,
      });

      await User.findByIdAndUpdate(req.user.id, {
        coverPhoto: uploadResult.secure_url,
      });

      return res.redirect("/hesap?success=Kapak+fotoğrafı+güncellendi");
    } catch (err) {
      if (err.message.includes("File size too large")) {
        return res.redirect("/hesap?error=Görsel+10MB'den+küçük+olmalıdır");
      }

      console.error("Cover upload error:", err);
      return res.redirect("/hesap?error=Kapak+yüklenemedi");
    }
  } catch (err) {
    console.log(err);
    return res.redirect("/hesap?error=Kapak+yüklenemedi");
  }
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
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect("/hesap?error=Kullanıcı+bulunamadı");
    }

    const blogs = await Post.find({ user_id: userId });

    for (const blog of blogs) {
      if (blog.images && blog.images.length) {
        for (const img of blog.images) {
          const publicId = img.public_id;
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (_) {}
        }
      }
    }

    await Post.deleteMany({ user_id: userId });
    await Comment.deleteMany({ user_id: userId });

    if (user.avatarPublicId)
      await cloudinary.uploader.destroy(user.avatarPublicId);
    if (user.coverPublicId)
      await cloudinary.uploader.destroy(user.coverPublicId);

    await User.findByIdAndDelete(userId);

    res.clearCookie("auth_token");
    return res.redirect("/?success=Hesap+başarıyla+silindi");
  } catch (err) {
    console.log(err);
    res.redirect("/hesap?error=Hesap+silinemedi");
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
