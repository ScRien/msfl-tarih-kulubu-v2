// routes/profile.js

import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

const router = express.Router();

/* ================================
   @USERNAME → PROFIL SAYFASI
================================ */
router.get("/@:username", async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res
        .status(404)
        .render("pages/404", { message: "Kullanıcı bulunamadı." });
    }

    const blogCount = await Post.countDocuments({ username });
    const commentCount = await Comment.countDocuments({ username });

    const lastBlogs = await Post.find({ username })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    const lastComments = await Comment.find({ username })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    res.render("pages/publicProfile", {
      user,
      blogCount,
      commentCount,
      lastBlogs,
      lastComments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Profil yüklenemedi.");
  }
});

/* ================================
   @USERNAME/BLOGS → TÜM BLOGLAR
================================ */
router.get("/@:username/blogs", async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).render("pages/404");

    const blogs = await Post.find({ username }).sort({ date: -1 }).lean();

    res.render("pages/userBlogs", {
      user,
      blogs,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Blog listesi yüklenemedi.");
  }
});

/* ================================
   @USERNAME/COMMENTS → TÜM YORUMLAR
================================ */
router.get("/@:username/comments", async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).render("pages/404");

    const comments = await Comment.find({ username }).sort({ date: -1 }).lean();

    comments.forEach((c) => {
      if (c.post_id && c.post_id.toString) {
        c.post_id = c.post_id.toString();
      }
    });

    res.render("pages/userComments", {
      user,
      comments,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Yorum listesi yüklenemedi.");
  }
});

export default router;
