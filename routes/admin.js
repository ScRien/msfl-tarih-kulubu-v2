// routes/admin.js
import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import mongoose from "mongoose";
import upload from "../middlewares/upload.js";
import cloudinary from "../helpers/cloudinary.js";
import "dotenv/config";

const admin = express.Router();

/* ============================================================
   ADMIN AUTH MIDDLEWARE
============================================================ */
function adminOnly(req, res, next) {
  // Artık req.session yerine req.user kullanıyoruz (JWT'den geliyor)
  if (!req.user || req.user.role !== "admin") {
    return res.redirect("/admin/giris?error=Yetkisiz+erişim");
  }
  next();
}

/* ============================================================
   /admin redirect
============================================================ */
admin.get("/", (req, res) => {
  if (req.session.role === "admin") {
    return res.redirect("/admin/blog");
  }
  return res.redirect("/admin/giris");
});

/* ============================================================
   LOGIN PAGE
============================================================ */
admin.get("/giris", (req, res) => {
  res.render("pages/admin/adminGiris", {
    error: req.query.error || null,
  });
});

/* ============================================================
   LOGIN POST (3 Password)
============================================================ */
admin.post("/giris", loginLimiter, async (req, res) => {
  try {
    const { adminToken } = req.body;

    const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN;

    if (!ADMIN_TOKEN || adminToken !== ADMIN_TOKEN) {
      logger.warn("Admin panel yetkisiz giriş denemesi:", {
        ip: req.ip,
        userAgent: req.get("user-agent"),
      });
      return res.redirect("/admin/giris?error=Geçersiz+admin+token");
    }

    // JWT Token Oluştur
    const jwt = await import("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "jwt_super_secret_123";

    const token = jwt.sign(
      {
        id: "admin",
        username: "admin",
        role: "admin",
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Cookie'ye kaydet
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // CSRF koruması için strict
      maxAge: 8 * 60 * 60 * 1000,
    });

    logger.info("Admin panel başarılı giriş:", {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.redirect("/admin/blog");
  } catch (err) {
    logger.error("Admin login error:", err);
    return res.redirect("/admin/giris?error=Bir+hata+oluştu");
  }
});

/* ============================================================
   ADMIN LOGOUT
============================================================ */
admin.get("/cikis", adminOnly, (req, res) => {
  res.clearCookie("auth_token", {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.redirect("/");
});
/* ============================================================
   BLOG PANEL
============================================================ */
admin.get("/blog", adminOnly, async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("user_id", "username avatar")
      .sort({ date: -1 })
      .lean();

    // BLOG SAYISI
    const totalBlogs = await Post.countDocuments();

    // TOPLAM GÖRSEL SAYISI
    // (images array'indeki tüm item'ları sayıyoruz)
    const imgAgg = await Post.aggregate([
      { $project: { imgCount: { $size: "$images" } } },
      { $group: { _id: null, total: { $sum: "$imgCount" } } },
    ]);

    const totalImages = imgAgg.length > 0 ? imgAgg[0].total : 0;

    // YORUM SAYISI
    const totalComments = await Comment.countDocuments();

    res.render("pages/admin/adminBlogPanel", {
      posts,
      stats: {
        totalBlogs,
        totalImages,
        totalComments,
      },
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.log(err);
    res.render("pages/admin/adminBlogPanel", {
      posts: [],
      stats: { totalBlogs: 0, totalImages: 0, totalComments: 0 },
      error: "Blog paneli yüklenemedi.",
    });
  }
});

/* ============================================================
   BLOG DELETE
============================================================ */
admin.post("/blog/:id/sil", adminOnly, async (req, res) => {
  try {
    const id = req.params.id;

    // Blogun Cloudinary görsellerini sil
    const post = await Post.findById(id);
    if (post && post.images.length > 0) {
      for (const img of post.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // Blogu sil
    await Post.findByIdAndDelete(id);

    // Blog'a ait yorumlar
    await Comment.deleteMany({ post_id: id });

    return res.redirect("/admin/blog?success=Blog+silindi");
  } catch (err) {
    console.log(err);
    return res.redirect("/admin/blog?error=Blog+silinemedi");
  }
});

/* ============================================================
   BLOG EDIT (GET)
============================================================ */
admin.get("/blog/:id/duzenle", adminOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    res.render("pages/admin/adminBlogEdit", { post });
  } catch (err) {
    res.redirect("/admin/blog?error=Blog+bulunamadı");
  }
});

/* ============================================================
   BLOG EDIT (POST + CLOUDINARY)
============================================================ */
admin.post("/blog/:id/duzenle", adminOnly, async (req, res) => {
  try {
    const { title, content, published } = req.body;

    await Post.findByIdAndUpdate(req.params.id, {
      title,
      content,
      published: published === "on",
    });

    return res.redirect("/admin/blog?success=Blog+güncellendi");
  } catch (err) {
    console.log(err);
    return res.redirect("/admin/blog?error=Blog+güncellenemedi");
  }
});

/* ============================================================
   USER PANEL
============================================================ */
admin.get("/kullanici", adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ date: -1 }).lean();
    const totalUsers = users.length;

    const blogWriterIds = await Post.distinct("user_id");
    const blogWriterCount = blogWriterIds.length;

    const blogCountsAgg = await Post.aggregate([
      {
        $group: { _id: "$user_id", count: { $sum: 1 } },
      },
    ]);

    const blogCountMap = {};
    blogCountsAgg.forEach((i) => {
      blogCountMap[i._id?.toString()] = i.count;
    });

    res.render("pages/admin/adminUserPanel", {
      users,
      totalUsers,
      blogWriterCount,
      blogCountMap,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    res.render("pages/admin/adminUserPanel", {
      users: [],
      error: "Kullanıcılar yüklenemedi.",
    });
  }
});

/* ============================================================
   USER DELETE (FULL WIPE)
============================================================ */
admin.post("/kullanici/:id/sil", adminOnly, async (req, res) => {
  const userId = req.params.id;

  try {
    const posts = await Post.find({ user_id: userId }).lean();
    const postIds = posts.map((p) => p._id);

    await Comment.deleteMany({ user_id: userId });
    await Comment.deleteMany({ post_id: { $in: postIds } });
    await Post.deleteMany({ _id: { $in: postIds } });

    await mongoose.connection.collection("sessions").deleteMany({
      session: { $regex: `"userId":"${userId}"` },
    });

    await User.findByIdAndDelete(userId);

    return res.redirect("/admin/kullanici?success=Kullanıcı+silindi");
  } catch (err) {
    console.log(err);
    return res.redirect("/admin/kullanici?error=Silinemedi");
  }
});

/* ============================================================
   USER EDIT (GET)
============================================================ */
admin.get("/kullanici/:id/duzenle", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    res.render("pages/admin/adminUserEdit", { user });
  } catch (err) {
    res.redirect("/admin/kullanici?error=Bulunamadı");
  }
});

/* ============================================================
   USER EDIT (POST)
============================================================ */
admin.post("/kullanici/:id/duzenle", adminOnly, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
    });

    return res.redirect("/admin/kullanici?success=Güncellendi");
  } catch (err) {
    return res.redirect("/admin/kullanici?error=Güncellenemedi");
  }
});

/* ============================================================
   COMMENTS PANEL
============================================================ */
admin.get("/yorumlar", adminOnly, async (req, res) => {
  try {
    const comments = await Comment.find({})
      .populate("user_id", "username")
      .populate("post_id", "title")
      .sort({ date: -1 })
      .lean();

    res.render("pages/admin/adminCommentPanel", {
      comments,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    res.render("pages/admin/adminCommentPanel", {
      comments: [],
      error: "Yorumlar yüklenemedi.",
    });
  }
});

/* ============================================================
   COMMENT DELETE
============================================================ */
admin.post("/yorum/:id/sil", adminOnly, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    return res.redirect("/admin/yorumlar?success=Silindi");
  } catch (err) {
    return res.redirect("/admin/yorumlar?error=Silinemedi");
  }
});

/* ============================================================
   COMMENT EDIT (GET)
============================================================ */
admin.get("/yorum/:id/duzenle", adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate("user_id", "username")
      .populate("post_id", "title")
      .lean();

    res.render("pages/admin/adminCommentEdit", { comment });
  } catch (err) {
    res.redirect("/admin/yorumlar?error=Bulunamadı");
  }
});

/* ============================================================
   COMMENT EDIT (POST)
============================================================ */
admin.post("/yorum/:id/duzenle", adminOnly, async (req, res) => {
  try {
    await Comment.findByIdAndUpdate(req.params.id, {
      content: req.body.content,
    });

    return res.redirect("/admin/yorumlar?success=Güncellendi");
  } catch (err) {
    return res.redirect("/admin/yorumlar?error=Başarısız");
  }
});

/* ============================================================
   YORUM PANELİ GÖSTER
============================================================== */
admin.get("/yorum", adminOnly, async (req, res) => {
  try {
    const comments = await Comment.find({})
      .populate("user_id", "username avatar")
      .populate("post_id", "title")
      .sort({ date: -1 })
      .lean();

    const totalComments = comments.length;

    res.render("pages/admin/adminCommentPanel", {
      comments,
      totalComments,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error(err);
    res.render("pages/admin/adminCommentPanel", {
      comments: [],
      totalComments: 0,
      error: "Yorumlar yüklenemedi",
    });
  }
});

/* ============================================================
   YORUM SİL
============================================================== */
admin.post("/yorum/:id/sil", adminOnly, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    return res.redirect("/admin/yorum?success=Yorum+silindi");
  } catch (err) {
    console.log(err);
    return res.redirect("/admin/yorum?error=Yorum+silinemedi");
  }
});

/* ============================================================
   YORUM DÜZENLE
============================================================== */
admin.post("/yorum/:id/duzenle", adminOnly, async (req, res) => {
  try {
    const { content } = req.body;

    await Comment.findByIdAndUpdate(req.params.id, {
      content,
    });

    return res.redirect("/admin/yorum?success=Yorum+güncellendi");
  } catch (err) {
    console.log(err);
    return res.redirect("/admin/yorum?error=Yorum+güncellenemedi");
  }
});

export default admin;
