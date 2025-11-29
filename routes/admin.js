import express from "express";
import jwt from "jsonwebtoken";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

const admin = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

/* =========================
   ADMIN KORUMA
========================= */
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.redirect("/admin/giris");
  }
  next();
}

/* =========================
   /admin → yönlendirme
========================= */
admin.get("/", (req, res) => {
  if (req.user && req.user.role === "admin") {
    return res.redirect("/admin/dashboard");
  }
  return res.redirect("/admin/giris");
});

/* =========================
   GİRİŞ SAYFASI
========================= */
admin.get("/giris", (req, res) => {
  res.render("pages/admin/login", { layout: false });
});

/* =========================
   GİRİŞ POST
========================= */
admin.post("/giris", (req, res) => {
  const { token } = req.body;

  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    return res.render("admin/login", {
      layout: false,
      error: "Geçersiz admin token",
    });
  }

  const jwtToken = jwt.sign(
    { role: "admin", username: "admin" },
    JWT_SECRET,
    { expiresIn: "6h" }
  );

  res.cookie("auth_token", jwtToken, {
    httpOnly: true,
    sameSite: "strict",
  });

  res.redirect("/admin/dashboard");
});

/* =========================
   ÇIKIŞ
========================= */
admin.get("/cikis", (req, res) => {
  res.clearCookie("auth_token");
  res.redirect("/admin/giris");
});

/* =========================
   DASHBOARD
========================= */
admin.get("/dashboard", adminOnly, async (req, res) => {
  const stats = {
    blogs: await Post.countDocuments(),
    users: await User.countDocuments(),
    comments: await Comment.countDocuments(),
  };

  res.render("pages/admin/dashboard", { layout: "admin", stats });
});

/* =========================
   BLOG PANEL
========================= */
admin.get("/bloglar", adminOnly, async (req, res) => {
  const posts = await Post.find().sort({ date: -1 }).lean();
  res.render("pages/admin/bloglar", { layout: "admin", posts });
});

export default admin;
