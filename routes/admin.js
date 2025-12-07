import express from "express";
import jwt from "jsonwebtoken";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import ImageKit from "imagekit";

const admin = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

// ImageKit (Resim Silme İçin)
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/* =========================
   MIDDLEWARE: ADMIN KORUMA
========================= */
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.redirect("/admin/giris");
  }
  next();
}

/* =========================
   GİRİŞ & ÇIKIŞ
========================= */
admin.get("/", (req, res) => {
  if (req.user && req.user.role === "admin")
    return res.redirect("/admin/dashboard");
  return res.redirect("/admin/giris");
});

admin.get("/giris", (req, res) => {
  res.render("pages/admin/login", { layout: false });
});

admin.post("/giris", (req, res) => {
  const { token } = req.body;
  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    return res.render("pages/admin/login", {
      layout: false,
      error: "Geçersiz Token!",
    });
  }
  const jwtToken = jwt.sign(
    { role: "admin", username: "admin", id: "admin_id" },
    JWT_SECRET,
    { expiresIn: "6h" }
  );
  res.cookie("auth_token", jwtToken, { httpOnly: true, sameSite: "strict" });
  res.redirect("/admin/dashboard");
});

admin.get("/cikis", (req, res) => {
  res.clearCookie("auth_token");
  res.redirect("/");
});

/* =========================
   DASHBOARD
========================= */
admin.get("/dashboard", adminOnly, async (req, res) => {
  try {
    const stats = {
      blogCount: await Post.countDocuments(),
      userCount: await User.countDocuments(),
      commentCount: await Comment.countDocuments(),
    };
    // Son 5 kayıt
    const recentBlogs = await Post.find().sort({ date: -1 }).limit(5).lean();
    const recentUsers = await User.find().sort({ date: -1 }).limit(5).lean();

    res.render("pages/admin/dashboard", {
      layout: "admin",
      active: "dashboard",
      stats,
      recentBlogs,
      recentUsers,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

/* =========================
   1) KULLANICI YÖNETİMİ
========================= */
// Liste
admin.get("/kullanicilar", adminOnly, async (req, res) => {
  try {
    const search = req.query.q || "";
    const query = search
      ? {
          $or: [
            { username: new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
          ],
        }
      : {};
    const users = await User.find(query).sort({ date: -1 }).lean();

    res.render("pages/admin/users", {
      layout: "admin",
      active: "users",
      users,
      search,
      csrfToken: req.csrfToken ? req.csrfToken() : "",
    });
  } catch (err) {
    res.redirect("/admin/dashboard");
  }
});

// Detay (Blogları ve Yorumlarıyla)
admin.get("/kullanici/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.redirect("/admin/kullanicilar");

    const userBlogs = await Post.find({ user_id: user._id })
      .sort({ date: -1 })
      .lean();
    const userComments = await Comment.find({ user_id: user._id })
      .sort({ date: -1 })
      .lean();

    res.render("pages/admin/userDetail", {
      layout: "admin",
      active: "users",
      targetUser: user,
      userBlogs,
      userComments,
      csrfToken: req.csrfToken ? req.csrfToken() : "",
    });
  } catch (err) {
    res.redirect("/admin/kullanicilar");
  }
});

// Sil (Tüm verileriyle)
admin.post("/kullanici/:id/sil", adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (user) {
      // Profil resimlerini sil
      if (user.avatar?.fileId)
        await imagekit.deleteFile(user.avatar.fileId).catch(() => {});
      if (user.coverImage?.fileId)
        await imagekit.deleteFile(user.coverImage.fileId).catch(() => {});

      // Kullanıcının bloglarını ve o blogların resimlerini sil
      const userBlogs = await Post.find({ user_id: userId });
      for (const blog of userBlogs) {
        if (blog.images && blog.images.length > 0) {
          for (const img of blog.images) {
            if (img.fileId)
              await imagekit.deleteFile(img.fileId).catch(() => {});
          }
        }
      }

      await User.findByIdAndDelete(userId);
      await Post.deleteMany({ user_id: userId });
      await Comment.deleteMany({ user_id: userId });
    }
    res.redirect("/admin/kullanicilar?success=Kullanıcı+silindi");
  } catch (err) {
    res.redirect("/admin/kullanicilar?error=Hata");
  }
});

// Rol Değiştir
admin.post("/kullanici/:id/rol", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();
    res.redirect(`/admin/kullanici/${user._id}`);
  } catch (err) {
    res.redirect("/admin/kullanicilar");
  }
});

/* =========================
   2) BLOG YÖNETİMİ
========================= */
admin.get("/bloglar", adminOnly, async (req, res) => {
  try {
    const search = req.query.q || "";
    const query = search ? { title: new RegExp(search, "i") } : {};
    const blogs = await Post.find(query).sort({ date: -1 }).lean();

    res.render("pages/admin/blogs", {
      layout: "admin",
      active: "blogs",
      blogs,
      search,
      csrfToken: req.csrfToken ? req.csrfToken() : "",
    });
  } catch (err) {
    res.redirect("/admin/dashboard");
  }
});

admin.post("/blog/:id/sil", adminOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (post.images && post.images.length > 0) {
        for (const img of post.images) {
          if (img.fileId) await imagekit.deleteFile(img.fileId).catch(() => {});
        }
      }
      await Comment.deleteMany({ post_id: post._id });
      await Post.findByIdAndDelete(req.params.id);
    }
    res.redirect("/admin/bloglar?success=Blog+silindi");
  } catch (err) {
    res.redirect("/admin/bloglar?error=Hata");
  }
});

// Admin Blog Düzenleme Sayfası (Kendi Layout'umuzda değil, normal editörde açalım)
admin.get("/blog/:id/duzenle", adminOnly, async (req, res) => {
  const post = await Post.findById(req.params.id).lean();
  res.render("pages/blogDuzenle", {
    post,
    layout: "main", // Normal site layout'u (Editör scriptleri için)
    isAdminEdit: true,
    csrfToken: req.csrfToken ? req.csrfToken() : "",
  });
});

/* =========================
   3) YORUM YÖNETİMİ
========================= */
admin.get("/yorumlar", adminOnly, async (req, res) => {
  try {
    const comments = await Comment.find().sort({ date: -1 }).limit(100).lean();
    res.render("pages/admin/comments", {
      layout: "admin",
      active: "comments",
      comments,
      csrfToken: req.csrfToken ? req.csrfToken() : "",
    });
  } catch (err) {
    res.redirect("/admin/dashboard");
  }
});

// Yorum Düzenle (GET)
admin.get("/yorum/:id/duzenle", adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).lean();
    if (!comment) return res.redirect("/admin/yorumlar");
    res.render("pages/admin/commentEdit", {
      layout: "admin",
      active: "comments",
      comment,
      csrfToken: req.csrfToken ? req.csrfToken() : "",
    });
  } catch (err) {
    res.redirect("/admin/yorumlar");
  }
});

// Yorum Düzenle (POST)
admin.post("/yorum/:id/duzenle", adminOnly, async (req, res) => {
  try {
    await Comment.findByIdAndUpdate(req.params.id, {
      content: req.body.content.trim(),
    });
    res.redirect("/admin/yorumlar?success=Güncellendi");
  } catch (err) {
    res.redirect("/admin/yorumlar?error=Hata");
  }
});

// Yorum Sil
admin.post("/yorum/:id/sil", adminOnly, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.redirect("/admin/yorumlar?success=Silindi");
});

export default admin;
