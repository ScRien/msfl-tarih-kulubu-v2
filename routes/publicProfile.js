import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

const publicProfile = express.Router();

function normalizeSocial(user) {
  if (!user.social) user.social = {};

  const s = user.social;

  if (s.instagram) {
    s.instagram = s.instagram
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\//, "")
      .replace(/^(www\.)?instagram\.com\//, "");
  }

  if (s.x) {
    s.x = s.x
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\//, "")
      .replace(/^(www\.)?(x\.com|twitter\.com)\//, "");
  }

  if (s.github) {
    s.github = s.github
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^(www\.)?github\.com\//, "");
  }

  user.social = s;
  return user;
}

publicProfile.get("/test/social", async (req, res) => {
  const u = await User.findOne({ username: "sahfidan" }).lean();
  return res.json(u);
});

/* ============================================================
   PUBLIC PROFIL — /@username
============================================================ */
publicProfile.get("/@:username", async (req, res) => {
  try {
    const username = req.params.username;

    let user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).render("pages/404", { message: "Kullanıcı bulunamadı" });
    }

    user = normalizeSocial(user);

    const totalBlogs = await Post.countDocuments({ user_id: user._id });
    const totalComments = await Comment.countDocuments({ user_id: user._id });

    const lastBlogs = await Post.find({ user_id: user._id })
      .sort({ date: -1 })
      .limit(6)
      .lean();

    const lastComments = await Comment.find({ user_id: user._id })
      .populate("post_id", "_id title")
      .sort({ date: -1 })
      .limit(5)
      .lean();

    return res.render("pages/profile", {
      user,
      stats: {
        totalBlogs,
        totalComments,
      },
      lastBlogs,
      lastComments,
    });
  } catch (err) {
    console.error("Public profile error:", err);
    return res.status(500).render("pages/404", {
      message: "Bir hata meydana geldi",
    });
  }
});

/* ============================================================
   TÜM BLOGLAR — /@username/blogs
============================================================ */
publicProfile.get("/@:username/blogs", async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).lean();
  if (!user) return res.status(404).render("pages/404");

  const blogs = await Post.find({ user_id: user._id })
    .sort({ date: -1 })
    .lean();

  res.render("pages/profileBlogs", {
    user,
    blogs,
  });
});

/* ============================================================
   TÜM YORUMLAR — /@username/comments
============================================================ */
publicProfile.get("/@:username/comments", async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).lean();
  if (!user) return res.status(404).render("pages/404");

  const comments = await Comment.find({ user_id: user._id })
    .sort({ date: -1 })
    .lean();

  res.render("pages/profileComments", {
    user,
    comments,
  });
});

export default publicProfile;
