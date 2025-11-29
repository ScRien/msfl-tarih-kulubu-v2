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

  const jwtToken = jwt.sign({ role: "admin", username: "admin" }, JWT_SECRET, {
    expiresIn: "6h",
  });

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
  const blogStats = await Post.aggregate([
    {
      $group: {
        _id: { $month: "$date" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const blogsPerMonth = Array(12).fill(0);
  blogStats.forEach((m) => {
    blogsPerMonth[m._id - 1] = m.count;
  });

  const stats = {
    blogs: await Post.countDocuments(),
    users: await User.countDocuments(),
    comments: await Comment.countDocuments(),
  };

  res.render("pages/admin/dashboard", {
    layout: "admin",
    stats,
    blogsPerMonth: JSON.stringify(blogsPerMonth),
  });
});

/* =========================
   BLOG PANEL
========================= */
admin.get("/bloglar", adminOnly, async (req, res) => {
  const posts = await Post.find().sort({ date: -1 }).lean();
  res.render("pages/admin/bloglar", { layout: "admin", posts });
});

// BLOG SİL
admin.post("/blog/:id/sil", adminOnly, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/admin/bloglar");
});

// BLOG DÜZENLE (GET)
admin.get("/blog/:id/duzenle", adminOnly, async (req, res) => {
  const post = await Post.findById(req.params.id).lean();
  res.render("admin/blogEdit", {
    layout: "admin",
    post,
  });
});

// BLOG DÜZENLE (POST)
admin.post("/blog/:id/duzenle", adminOnly, async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    content: req.body.content,
  });
  res.redirect("/admin/bloglar");
});

/* ============================================================
   USER CREATE (GET)
============================================================ */
admin.get("/kullanici/ekle", adminOnly, (req, res) => {
  res.render("pages/admin/adminUserCreate", {
    error: req.query.error || null,
    success: req.query.success || null,
  });
});

/* ============================================================
   USER CREATE (POST)
============================================================ */
admin.post("/kullanici/ekle", adminOnly, async (req, res) => {
  try {
    const { username, email, name, surname } = req.body;

    if (!username || !email) {
      return res.redirect("/admin/kullanici/ekle?error=Zorunlu+alan+eksik");
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.redirect("/admin/kullanici/ekle?error=Kullanıcı+zaten+var");
    }

    const password = Math.random().toString(36).slice(-8);

    const newUser = new User({
      username,
      email,
      name,
      surname,
      password,
      role: "user",
    });

    await newUser.save();

    return res.redirect(
      "/admin/kullanici?success=Yeni+kullanıcı+eklendi"
    );
  } catch (err) {
    console.log(err);
    return res.redirect(
      "/admin/kullanici/ekle?error=Kullanıcı+eklenemedi"
    );
  }
});

export default admin;
