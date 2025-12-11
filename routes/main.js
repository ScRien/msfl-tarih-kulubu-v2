import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

// === SAYFA ROTALARI ===
router.get("/", (req, res) => res.render("pages/anasayfa"));
router.get("/hakkinda", (req, res) => res.render("pages/hakkinda"));
router.get("/etkinlikler", (req, res) => res.render("pages/etkinlikler"));
router.get("/tarihteBugun", (req, res) => res.render("pages/tarihteBugun"));

/* ============================================================
   BLOG SAYFASI (Pagination + JWT DESTEKLİ)
============================================================ */
router.get("/blog", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;

    const totalBlogs = await Post.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    const posts = await Post.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.render("pages/blog", {
      posts,

      // 🔥 Artık JWT üzerinden kullanıcı bilgisi geliyor
      isAuth: !!req.user,
      currentUser: req.user ? req.user.username : null,

      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.error(err);

    res.render("pages/blog", {
      posts: [],
      isAuth: !!req.user,
      currentUser: req.user ? req.user.username : null,

      currentPage: 1,
      totalPages: 1,
    });
  }
});

export default router;
