// routes/hesap.js
import express from "express";
import auth from "../middlewares/auth.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { sendMail } from "../helpers/mail.js";
import {
  accountDeletedMailTemplate,
  verificationMailTemplate,
} from "../helpers/mailTemplates.js";
import {
  profileValidation,
  socialValidation,
} from "../middlewares/hesapValidators.js";
import Backup from "../models/Backup.js";
import bcrypt from "bcrypt";

const router = express.Router();

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
  });
});

/* ================= PROFİL ================= */
router.post("/profil", auth, async (req, res) => {
  const updateData = {};

  if (req.body.email) {
    const email = req.body.email.trim().toLowerCase();

    const existing = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    });

    if (existing) {
      return res.redirect(
        "/hesap?error=Bu%20e-posta%20başka%20bir%20hesapta%20kayıtlı"
      );
    }

    updateData.email = email;
  }

  if (typeof req.body.bio === "string") {
    updateData.bio = req.body.bio.trim();
  }

  await User.findByIdAndUpdate(req.user.id, updateData);
  res.redirect("/hesap?success=Profil%20bilgileri%20güncellendi");
});

/* ================= SOSYAL ================= */
router.post("/social", auth, socialValidation, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    social: req.body,
  });

  res.redirect("/hesap?success=Sosyal%20medya%20bilgileri%20güncellendi");
});

/* ================= ÇEREZ ================= */
router.post("/cookies", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    analyticsCookies: !!req.body.analyticsCookies,
    personalizationCookies: !!req.body.personalizationCookies,
  });
  res.redirect("/hesap?success=Çerez%20tercihleri%20güncellendi");
});

/* ================= VERİ ================= */
router.post("/data-usage", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    serviceDataUsage: !!req.body.serviceDataUsage,
    personalizedContent: !!req.body.personalizedContent,
  });
  res.redirect("/hesap?success=Veri%20kullanım%20ayarları%20güncellendi");
});

router.get("/sifre-yeni", auth, (req, res) => {
  res.render("pages/sifreYeni");
});

/* ================= KOD DOĞRULA ================= */
router.post("/sifre-dogrula", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (
    !user.resetCode ||
    user.resetCode !== req.body.code ||
    user.resetCodeExpires < Date.now()
  ) {
    return res.redirect("/hesap?error=Kod%20geçersiz%20veya%20süresi%20dolmuş");
  }

  res.redirect("/hesap/sifre-yeni");
});

router.post("/sifre-yeni", auth, async (req, res) => {
  const { password1, password2 } = req.body;

  if (!password1 || password1 !== password2) {
    return res.redirect("/hesap/sifre-yeni?error=Şifreler%20uyuşmuyor");
  }

  const user = await User.findById(req.user.id);
  const hashed = await bcrypt.hash(password1, 10);

  user.password = hashed;
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;

  await user.save();

  res.redirect("/hesap?success=Şifre%20başarıyla%20güncellendi");
});


/* ================= ŞİFRE ================= */
router.post("/sifre-kod", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = code;
  user.resetCodeExpires = Date.now() + 600000;
  await user.save();

  await sendMail(
    user.email,
    "Doğrulama Kodunuz",
    verificationMailTemplate(user.name, code)
  );
  res.redirect(
    "/hesap?success=Doğrulama%20kodu%20mailinize%20gönderildi&showVerify=1"
  );
});

/* ================= SİL ================= */
router.post("/sil", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.redirect("/hesap?error=Şifre%20hatalı");

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
  res.redirect("/?success=Hesabınız%20başarıyla%20silindi");
});

export default router;
