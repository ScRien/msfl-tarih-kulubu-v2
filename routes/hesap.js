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
  const { name, surname, email, bio } = req.body;
  await User.findByIdAndUpdate(req.user.id, {
    name,
    surname,
    email,
    bio: bio?.trim() || "",
  });
  res.redirect("/hesap?success=ok");
});

/* ================= SOSYAL ================= */
router.post("/social", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    social: req.body,
  });
  res.redirect("/hesap?success=ok");
});

/* ================= ÇEREZ ================= */
router.post("/cookies", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    analyticsCookies: !!req.body.analyticsCookies,
    personalizationCookies: !!req.body.personalizationCookies,
  });
  res.redirect("/hesap?success=ok");
});

/* ================= VERİ ================= */
router.post("/data-usage", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    serviceDataUsage: !!req.body.serviceDataUsage,
    personalizedContent: !!req.body.personalizedContent,
  });
  res.redirect("/hesap?success=ok");
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
  res.redirect("/hesap?showVerify=1");
});

/* ================= SİL ================= */
router.post("/sil", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.redirect("/hesap?error=şifre");

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
  res.redirect("/");
});

export default router;
