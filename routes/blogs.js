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

/* ============================================================
   BLOG OLUŞTUR (GET)
============================================================ */
blogs.get("/olustur", auth, (req, res) => {
  res.render("pages/blogOlustur", {
    error: req.query.error || null,
    success: req.query.success || null,
    data: {},
  });
});

/* ============================================================
   BLOG OLUŞTUR (POST)
============================================================ */
blogs.post(
  "/olustur",
  auth,
  (req, res, next) => {
    // VALIDATION ERROR'DA BURAYA DÖNECEK
    req.validationErrorView = "pages/blogOlustur";
    req.validationErrorData = { data: req.body };
    next();
  },
  blogCreateLimiter,
  blogValidation,
  async (req, res) => {
    try {
      const { title, content } = req.body;

      let images = [];
      if (req.body.imageUrls) {
        try {
          const parsed = JSON.parse(req.body.imageUrls);
          if (Array.isArray(parsed))
            images = parsed.filter(
              (img) => img?.url && img?.public_id
            );
        } catch (e) {
          logger.warn("JSON parse error:", e);
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
      logger.error("Blog oluşturma hatası:", {
        message: err.message,
        stack: err.stack,
        user: req.user?.username,
        ip: req.ip,
      });

      return res.redirect("/blog/olustur?error=Bir+hata+oluştu");
    }
  }
);

/* ============================================================
   BLOG DÜZENLE (GET)
============================================================ */
blogs.get("/:id/duzenle", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).render("pages/404");

    const isOwner = post.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin)
      return res.status(403).send("Yetkiniz yok.");

    res.render("pages/blogDuzenle", { post });
  } catch (err) {
    logger.error("BLOG EDIT GET ERROR:", err);
    res.status(500).send("Hata oluştu");
  }
});

/* ============================================================
   BLOG DÜZENLE (POST)
============================================================ */
blogs.post("/:id/duzenle", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).render("pages/404");

    const isOwner = post.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin)
      return res.status(403).send("Yetkiniz yok.");

    // VALIDASYON UYGULA
    if (!req.body.title || req.body.title.trim().length < 5)
      return res.redirect(`/blog/${post._id}/duzenle?error=Başlık+çok+kısa`);

    if (!req.body.content || req.body.content.trim().length < 50)
      return res.redirect(`/blog/${post._id}/duzenle?error=İçerik+çok+kısa`);

    post.title = req.body.title.trim();
    post.content = req.body.content.trim();

    /* --- ESKİ GÖRSELLERİ SİLME --- */
    const toDelete = req.body.deleteImages;
    if (toDelete) {
      const array = Array.isArray(toDelete) ? toDelete : [toDelete];

      const validPublicIds = post.images
        .map((img) => img.public_id)
        .filter((id) => array.includes(id));

      for (const id of validPublicIds) {
        try {
          await cloudinary.uploader.destroy(id);
        } catch (err) {
          logger.error("Cloudinary delete error:", err);
        }
      }

      post.images = post.images.filter(
        (img) => !validPublicIds.includes(img.public_id)
      );
    }

    /* --- YENİ GÖRSELLER --- */
    if (req.body.newImagesJson) {
      try {
        const newImgs = JSON.parse(req.body.newImagesJson);
        if (Array.isArray(newImgs)) {
          const filtered = newImgs.filter(
            (img) => img.url && img.public_id
          );
          post.images.push(...filtered);
        }
      } catch (err) {
        logger.error("newImagesJson parse error:", err);
      }
    }

    await post.save();
    res.redirect(`/blog/${post._id}`);
  } catch (error) {
    logger.error("BLOG EDIT POST ERROR:", error);
    res.status(500).send("Blog düzenlenirken hata oluştu");
  }
});

/* ============================================================
   BLOG SİL
============================================================ */
blogs.post("/:id/sil", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect("/blog?error=Blog+bulunamadı");

    const isOwner = post.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin)
      return res.redirect("/blog?error=Yetkiniz+yok");

    for (const img of post.images) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {
        logger.error("Cloudinary destroy error:", err);
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.redirect("/blog?success=Blog+silindi");
  } catch (err) {
    logger.error("BLOG DELETE ERROR:", err);
    res.status(500).send("Blog silinirken hata oluştu");
  }
});

/* ============================================================
   YORUM EKLE
============================================================ */
blogs.post(
  "/:id/yorum",
  auth,
  (req, res, next) => {
    req.validationErrorView = "pages/blogDetay";
    req.validationErrorData = {};
    next();
  },
  commentLimiter,
  commentValidation,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).render("pages/404");

      await Comment.create({
        post_id: post._id,
        user_id: req.user.id,
        username: req.user.username,
        content: req.body.content.trim(),
      });

      return res.redirect(`/blog/${post._id}`);
    } catch (err) {
      logger.error("YORUM EKLE ERROR:", err);
      return res.redirect(`/blog/${req.params.id}?error=Yorum+eklenemedi`);
    }
  }
);

/* ============================================================
   YORUM SİL
============================================================ */
blogs.post("/:postId/yorum/:commentId/sil", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).render("pages/404");

    const isOwner = comment.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin)
      return res.status(403).send("Yetkiniz yok.");

    await Comment.findByIdAndDelete(req.params.commentId);
    return res.redirect(`/blog/${req.params.postId}`);
  } catch (err) {
    logger.error("YORUM SİL ERROR:", err);
    res.status(500).send("Yorum silinirken hata oluştu");
  }
});

/* ============================================================
   YORUM DÜZENLE
============================================================ */
blogs.post("/:postId/yorum/:commentId/duzenle", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).render("pages/404");

    const isOwner = comment.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin)
      return res.status(403).send("Yetkiniz yok.");

    const newContent = (req.body.content || "").trim();
    if (!newContent)
      return res.redirect(`/blog/${req.params.postId}`);

    comment.content = newContent;
    await comment.save();

    return res.redirect(`/blog/${req.params.postId}`);
  } catch (err) {
    logger.error("YORUM DÜZENLE ERROR:", err);
    res.status(500).send("Yorum düzenlenirken hata oluştu");
  }
});

/* ============================================================
   BLOG DETAY
============================================================ */
blogs.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).render("pages/404");

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
      error: req.query.error || null,
      success: req.query.success || null,
    });
  } catch (err) {
    logger.error("BLOG DETAY ERROR:", err);
    res.status(500).send("Hata oluştu");
  }
});

export default blogs;
