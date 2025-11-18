// routes/blogs.js
import express from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import auth from "../middlewares/auth.js";
import cloudinary from "../helpers/cloudinary.js";
import {
  blogValidation,
  commentValidation,
} from "../middlewares/validators.js";
import {
  blogCreateLimiter,
  commentLimiter,
} from "../middlewares/rateLimiter.js";
import logger from "../helpers/logger.js";

const blogs = express.Router();

/* ================================
   BLOG OLUŞTUR (GET)
================================ */
blogs.get("/olustur", auth, (req, res) => {
  res.render("pages/blogOlustur", {
    error: req.query.error || null,
    success: req.query.success || null,
  });
});

/* ================================
   BLOG OLUŞTUR (POST)
================================ */
blogs.post(
  "/olustur",
  auth,
  blogCreateLimiter,
  blogValidation,
  async (req, res) => {
    try {
      const { title, content } = req.body;

      // Validation middleware zaten kontrol etti
      let images = [];

      try {
        if (req.body.imageUrls) {
          const parsed = JSON.parse(req.body.imageUrls);
          if (Array.isArray(parsed)) {
            images = parsed.filter((img) => img.url && img.public_id);
          }
        }
      } catch (e) {
        console.log("JSON parse error:", e);
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
      logger.error("Blog oluşturma hatası:", {
        error: err.message,
        stack: err.stack,
        user: req.user?.username,
        ip: req.ip,
      });
      return res.redirect("/blog/olustur?error=Bir+hata+oluştu");
    }
  }
);

/* ================================
   BLOG DÜZENLE (GET)
================================ */
blogs.get("/:id/duzenle", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).send("Blog bulunamadı");

    const isOwner = post.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).send("Yetkiniz yok.");
    }

    res.render("pages/blogDuzenle", { post });
  } catch (err) {
    console.error("BLOG EDIT GET ERROR:", err);
    res.status(500).send("Hata oluştu");
  }
});

/* ================================
   BLOG DÜZENLE (POST)
================================ */
blogs.post("/:id/duzenle", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Blog bulunamadı");

    const isOwner = post.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).send("Yetkiniz yok.");
    }

    post.title = req.body.title;
    post.content = req.body.content;

    // ✅ GÜVENLİK: Client'tan gelen public_id'leri VERİTABANINDAKİLERLE KARŞILAŞTIR
    const toDelete = req.body.deleteImages;
    if (toDelete) {
      const deleteArray = Array.isArray(toDelete) ? toDelete : [toDelete];

      // ✅ Sadece bu blog'a ait public_id'leri sil
      const validPublicIds = post.images
        .map((img) => img.public_id)
        .filter((id) => deleteArray.includes(id));

      for (const publicId of validPublicIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`✅ Görsel silindi: ${publicId}`);
        } catch (err) {
          console.error(`❌ Cloudinary destroy error (${publicId}):`, err);
        }
      }

      // ✅ Sadece silinenleri filtrele
      post.images = post.images.filter(
        (img) => !validPublicIds.includes(img.public_id)
      );
    }

    // Yeni görseller
    if (req.body.newImagesJson) {
      try {
        const parsedNew = JSON.parse(req.body.newImagesJson);
        if (Array.isArray(parsedNew)) {
          const validNew = parsedNew.filter(
            (img) =>
              img &&
              typeof img.url === "string" &&
              typeof img.public_id === "string" &&
              img.url.trim() !== "" &&
              img.public_id.trim() !== ""
          );

          post.images.push(...validNew);
        }
      } catch (err) {
        console.error("newImagesJson parse hatası:", err);
      }
    }

    await post.save();
    res.redirect(`/blog/${post._id}`);
  } catch (error) {
    console.error("BLOG EDIT POST ERROR:", error);
    res.status(500).send("Blog düzenlenirken hata oluştu");
  }
});

/* ================================
   BLOG SİL
================================ */
blogs.post("/:id/sil", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).send("Blog bulunamadı");

    const isOwner = post.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).send("Bu blogu silemezsiniz.");
    }

    // Cloudinary görsellerini sil
    for (const img of post.images) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {
        console.error("Cloudinary destroy error:", err);
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    res.redirect("/blog");
  } catch (err) {
    console.error("BLOG DELETE ERROR:", err);
    res.status(500).send("Blog silinirken hata oluştu");
  }
});

/* ================================
   YORUM EKLE
================================ */
blogs.post(
  "/:id/yorum",
  auth,
  commentLimiter,
  commentValidation,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).send("Blog bulunamadı");

      const content = req.body.content.trim();

      await Comment.create({
        post_id: post._id,
        user_id: req.user.id,
        username: req.user.username,
        content,
      });

      res.redirect(`/blog/${post._id}`);
    } catch (err) {
      console.error("YORUM EKLE ERROR:", err);
      res.status(500).send("Yorum eklenirken hata oluştu");
    }
  }
);

/* ================================
   YORUM SİL
================================ */
blogs.post("/:postId/yorum/:commentId/sil", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).send("Yorum bulunamadı");

    const isOwner = comment.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).send("Bu yorumu silemezsiniz.");
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.redirect(`/blog/${req.params.postId}`);
  } catch (err) {
    console.error("YORUM SİL ERROR:", err);
    res.status(500).send("Yorum silinirken hata oluştu.");
  }
});

/* ================================
   YORUM DÜZENLE
================================ */
blogs.post("/:postId/yorum/:commentId/duzenle", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).send("Yorum bulunamadı.");

    const isOwner = comment.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).send("Bu yorumu düzenleyemezsiniz.");
    }

    const newContent = (req.body.content || "").trim();
    if (!newContent) return res.redirect(`/blog/${req.params.postId}`);

    comment.content = newContent;
    await comment.save();

    res.redirect(`/blog/${req.params.postId}`);
  } catch (err) {
    console.error("YORUM DÜZENLE ERROR:", err);
    res.status(500).send("Yorum düzenlenirken hata oluştu.");
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

    const isAuth = !!req.user;
    const isOwner = isAuth && post.user_id.toString() === req.user.id;
    const isAdmin = isAuth && req.user.role === "admin";

    res.render("pages/blogDetay", {
      post,
      comments,
      isAuth,
      currentUserId: req.user?.id,
      currentUsername: req.user?.username,
      currentRole: req.user?.role,
      isOwner,
      isAdmin,
    });
  } catch (err) {
    console.error("BLOG DETAY ERROR:", err);
    res.status(500).send("Hata oluştu");
  }
});

export default blogs;
