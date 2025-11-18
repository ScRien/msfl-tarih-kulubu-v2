// routes/blogs.js
import express from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import auth from "../middlewares/auth.js";
import cloudinary from "../helpers/cloudinary.js";

const blogs = express.Router();

/* ================================
   BLOG OLUŞTURMA
================================ */
blogs.get("/olustur", auth, (req, res) => {
  return res.render("pages/blogOlustur");
});

blogs.post("/olustur", auth, async (req, res) => {
  try {
    const { title, content, imageUrls } = req.body;

    if (!title || !content) {
      return res.redirect("/blog/olustur?error=Başlık+ve+içerik+zorunludur");
    }

    let images = [];
    if (imageUrls) {
      try {
        images = JSON.parse(imageUrls); // [{ url, public_id }, ...]
      } catch (e) {
        console.error("imageUrls parse error:", e);
        images = [];
      }
    }

    await Post.create({
      user_id: req.user.id,
      username: req.user.username,
      title,
      content,
      images,
    });

    return res.redirect("/blog?success=Blog+başarıyla+oluşturuldu");
  } catch (err) {
    console.error("BLOG ERROR:", err);
    return res.redirect("/blog/olustur?error=Bir+hata+oluştu");
  }
});

/* ================================
   BLOG DÜZENLE (GET)
================================ */
blogs.get("/:id/duzenle", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).send("Blog bulunamadı");

    // Sadece sahibi veya admin düzenleyebilsin
    if (post.user_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Yetkiniz yok.");
    }

    return res.render("pages/blogDuzenle", { post });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Hata oluştu");
  }
});

/* ================================
   BLOG DÜZENLE (POST)
================================ */
blogs.post("/:id/duzenle", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Blog bulunamadı");

    if (post.user_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Yetkiniz yok.");
    }

    const { title, content, deleteImages, newImagesJson } = req.body;

    post.title = title;
    post.content = content;

    // Silinecek görseller
    if (deleteImages) {
      const arr = Array.isArray(deleteImages) ? deleteImages : [deleteImages];

      for (const publicId of arr) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.error("Cloudinary destroy error:", e);
        }
      }

      post.images = post.images.filter((img) => !arr.includes(img.public_id));
    }

    // Yeni eklenen görseller (client-side Cloudinary)
    if (newImagesJson) {
      try {
        const newImgs = JSON.parse(newImagesJson); // [{ url, public_id }]
        post.images.push(...newImgs);
      } catch (e) {
        console.error("newImagesJson parse error:", e);
      }
    }

    await post.save();
    return res.redirect(`/blog/${post._id}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Blog düzenlenirken hata oluştu");
  }
});

/* ================================
   BLOG SİL
================================ */
blogs.post("/:id/sil", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Blog bulunamadı");

    if (post.user_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Bu blogu silemezsiniz.");
    }

    // Cloudinary görsellerini sil
    if (post.images && post.images.length) {
      for (const img of post.images) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (err) {
          console.error("Cloudinary destroy error:", err);
        }
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.redirect("/blog");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Blog silinirken hata oluştu");
  }
});

/* ================================
   YORUM EKLE
================================ */
blogs.post("/:id/yorum", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Blog bulunamadı");

    const content = (req.body.content || "").trim();
    if (!content) return res.redirect(`/blog/${post._id}`);

    await Comment.create({
      post_id: post._id,
      user_id: req.user.id,
      username: req.user.username,
      content,
    });

    return res.redirect(`/blog/${post._id}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Yorum eklenirken hata oluştu");
  }
});

/* ================================
   YORUM SİL
================================ */
blogs.post("/:postId/yorum/:commentId/sil", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).send("Yorum bulunamadı");

    if (comment.user_id.toString() !== req.user.id) {
      return res.status(403).send("Bu yorumu silemezsiniz.");
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    return res.redirect(`/blog/${req.params.postId}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Yorum silinirken hata oluştu.");
  }
});

/* ================================
   YORUM DÜZENLE
================================ */
blogs.post("/:postId/yorum/:commentId/duzenle", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).send("Yorum bulunamadı.");

    if (comment.user_id.toString() !== req.user.id) {
      return res.status(403).send("Bu yorumu düzenleyemezsiniz.");
    }

    const newContent = (req.body.content || "").trim();
    if (!newContent) return res.redirect(`/blog/${req.params.postId}`);

    comment.content = newContent;
    await comment.save();

    return res.redirect(`/blog/${req.params.postId}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Yorum düzenlenirken hata oluştu.");
  }
});

/* ================================
   BLOG DETAY
================================ */
blogs.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).send("Blog bulunamadı");

    const comments = await Comment.find({ post_id: post._id })
      .sort({ date: -1 })
      .lean();

    return res.render("pages/blogDetay", {
      post,
      comments,
      isAuth: !!req.user,
      currentUserId: req.user?.id,
      currentUsername: req.user?.username,
      currentRole: req.user?.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Hata oluştu");
  }
});

export default blogs;
