import express from "express";
import auth from "../middlewares/auth.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { sendMail } from "../helpers/mail.js";
import { verificationMailTemplate } from "../helpers/mailTemplates.js";
import { socialValidation } from "../middlewares/hesapValidators.js";
import Backup from "../models/Backup.js";
import bcrypt from "bcrypt";
import ImageKit from "imagekit";

const router = express.Router();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/* ============================================================
   HESAP SAYFASI
============================================================ */
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  res.render("pages/hesap", {
    user,
    username: user.username,
    showVerify: req.query.showVerify || null,
    showNewPasswordBox: req.query.showNewPasswordBox || false,
    error: req.query.error,
    success: req.query.success,
  });
});

/* ================= PROFİL GÜNCELLEME ================= */
router.post("/profil", auth, async (req, res) => {
  try {
    const updateData = {};
    const currentUser = await User.findById(req.user.id);

    /* =====================================================
       KULLANICI ADI GÜNCELLEME
    ===================================================== */
    if (req.body.username) {
      const username = req.body.username.trim();

      // format kontrolü
      const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return res.redirect("/hesap?error=Geçersiz+kullanıcı+adı");
      }

      // değişmiş mi?
      if (currentUser.username !== username) {
        const existing = await User.findOne({
          username,
          _id: { $ne: req.user.id },
        });

        if (existing) {
          return res.redirect("/hesap?error=Kullanıcı+adı+kullanımda");
        }

        updateData.username = username;
      }
    }

    /* =====================================================
       E-POSTA GÜNCELLEME
    ===================================================== */
    if (req.body.email) {
      const email = req.body.email.trim().toLowerCase();

      if (currentUser.email !== email) {
        const existing = await User.findOne({
          email,
          _id: { $ne: req.user.id },
        });

        if (existing) {
          return res.redirect("/hesap?error=Bu+e-posta+kullanımda");
        }

        updateData.email = email;
      }
    }

    /* =====================================================
       BİYOGRAFİ
    ===================================================== */
    if (typeof req.body.bio === "string") {
      updateData.bio = req.body.bio.trim();
    }

    /* =====================================================
       AVATAR GÜNCELLEME (ImageKit – güvenli parse)
    ===================================================== */
    if (req.body.avatar) {
      let avatarData = {};

      try {
        avatarData = JSON.parse(req.body.avatar);
      } catch {
        avatarData = { url: req.body.avatar, fileId: "" };
      }

      if (avatarData.url) {
        // eski avatarı sil
        if (
          currentUser.avatar &&
          currentUser.avatar.fileId &&
          avatarData.fileId
        ) {
          await imagekit
            .deleteFile(currentUser.avatar.fileId)
            .catch((e) => console.log("Silme hatası:", e.message));
        }

        updateData.avatar = {
          url: avatarData.url,
          fileId: avatarData.fileId || "",
          provider: "imagekit",
        };
      }
    }

    /* =====================================================
       KAPAK FOTOĞRAFI GÜNCELLEME
    ===================================================== */
    if (req.body.cover) {
      let coverData = {};

      try {
        coverData = JSON.parse(req.body.cover);
      } catch {
        coverData = { url: req.body.cover, fileId: "" };
      }

      if (coverData.url) {
        if (
          currentUser.coverImage &&
          currentUser.coverImage.fileId &&
          coverData.fileId
        ) {
          await imagekit
            .deleteFile(currentUser.coverImage.fileId)
            .catch((e) => console.log("Silme hatası:", e.message));
        }

        updateData.coverImage = {
          url: coverData.url,
          fileId: coverData.fileId || "",
          provider: "imagekit",
        };
      }
    }

    /* =====================================================
       VERİTABANI GÜNCELLE
    ===================================================== */
    await User.findByIdAndUpdate(req.user.id, updateData);
    res.redirect("/hesap?success=Profil+bilgileri+güncellendi");
  } catch (error) {
    console.error("Profil Güncelleme Hatası:", error);
    res.redirect("/hesap?error=Bir+hata+oluştu");
  }
});

/* ... Diğer route'lar aynı ... */
router.post("/social", auth, socialValidation, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { social: req.body });
    res.redirect("/hesap?success=Sosyal+medya+güncellendi");
  } catch (error) {
    res.redirect("/hesap?error=Hata");
  }
});

router.post("/cookies", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      analyticsCookies: !!req.body.analyticsCookies,
      personalizationCookies: !!req.body.personalizationCookies,
    });
    res.redirect("/hesap?success=Çerezler+güncellendi");
  } catch (error) {
    res.redirect("/hesap?error=Hata");
  }
});

router.post("/data-usage", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      serviceDataUsage: !!req.body.serviceDataUsage,
      personalizedContent: !!req.body.personalizedContent,
    });
    res.redirect("/hesap?success=Ayarlar+güncellendi");
  } catch (error) {
    res.redirect("/hesap?error=Hata");
  }
});

router.get("/sifre-yeni", auth, (req, res) => res.render("pages/sifreYeni"));
router.post("/sifre-dogrula", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (
    !user.resetCode ||
    user.resetCode !== req.body.code ||
    user.resetCodeExpires < Date.now()
  )
    return res.redirect("/hesap?error=Kod+geçersiz");
  res.redirect("/hesap/sifre-yeni");
});
router.post("/sifre-yeni", auth, async (req, res) => {
  const { password1: p1, password2: p2 } = req.body;
  if (!p1 || p1 !== p2)
    return res.redirect("/hesap/sifre-yeni?error=Uyuşmuyor");
  const user = await User.findById(req.user.id);
  user.password = await bcrypt.hash(p1, 10);
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  await user.save();
  res.redirect("/hesap?success=Şifre+değişti");
});
router.post("/sifre-kod", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = code;
  user.resetCodeExpires = Date.now() + 600000;
  await user.save();
  await sendMail(user.email, "Kod", verificationMailTemplate(user.name, code));
  res.redirect("/hesap?success=Kod+gönderildi&showVerify=1");
});
router.post("/sil", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.redirect("/hesap?error=Şifre+hatalı");

  if (user.avatar?.fileId)
    await imagekit.deleteFile(user.avatar.fileId).catch(() => {});
  if (user.coverImage?.fileId)
    await imagekit.deleteFile(user.coverImage.fileId).catch(() => {});

  const posts = await Post.find({ user_id: user._id }).lean();
  const comments = await Comment.find({ user_id: user._id }).lean();
  await Backup.create({
    userId: user._id,
    userData: { profile: user, posts, comments },
  });
  await User.findByIdAndDelete(user._id);
  await Post.deleteMany({ user_id: user._id });
  await Comment.deleteMany({ user_id: user._id });
  res.clearCookie("auth_token");
  res.redirect("/?success=Hesap+silindi");
});

export default router;
