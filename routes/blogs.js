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
import upload from "../middlewares/upload.js";

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
blogs.get("/duzenle/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();

    if (!post) {
      return res.redirect("/blog?error=Blog+bulunamadı");
    }

    if (post.user_id.toString() !== req.user.id) {
      return res.redirect("/blog?error=Bu+blogu+düzenleme+yetkin+yok");
    }

    res.render("pages/blogDuzenle", {
      post,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/blog?error=Bir+hata+oluştu");
  }
});

/* ============================================================
   BLOG DÜZENLE (POST)
============================================================ */
blogs.post("/duzenle/:id", auth, async (req, res) => {
  try {
    const blog = await Post.findById(req.params.id);
    if (!blog) return res.status(404).render("pages/404");

    // Sahip mi / admin mi?
    const isOwner = blog.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).send("Yetkisiz işlem");
    }

    const { title, content } = req.body;

    // 1) Mevcut görselleri kopyala
    let images = Array.isArray(blog.images) ? [...blog.images] : [];

    // 2) Silinecek görseller (public_id listesi)
    if (req.body.deleteImages) {
      let deleteList = [];
      try {
        deleteList = JSON.parse(req.body.deleteImages); // ["public_id1", "public_id2"]
      } catch (e) {
        deleteList = [];
      }

      if (deleteList.length) {
        // Cloudinary'den sil
        for (const publicId of deleteList) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            logger.error("Cloudinary destroy error (edit):", err);
          }
        }

        // DB'den sil
        images = images.filter(
          (img) => !deleteList.includes(img.public_id)
        );
      }
    }

    // 3) Yeni eklenen görseller (JS tarafında Cloudinary'e yüklendi)
    if (req.body.newImagesJson) {
      try {
        const newImgs = JSON.parse(req.body.newImagesJson); // [{url, public_id}, ...]
        if (Array.isArray(newImgs) && newImgs.length) {
          images = images.concat(
            newImgs.filter((i) => i.url && i.public_id)
          );
        }
      } catch (e) {
        logger.warn("newImagesJson parse error:", e);
      }
    }

    // 4) Blog alanlarını güncelle
    blog.title = title;
    blog.content = content;
    blog.images = images;

    await blog.save();

    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    logger.error("BLOG UPDATE ERROR:", err);
    const post = await Post.findById(req.params.id).lean();
    return res.render("pages/blogDuzenle", {
      post,
      error: "Bir hata oluştu.",
      csrfToken: req.csrfToken(),
    });
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
blogs.get("/:postId/yorum/:commentId/duzenle", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId).lean();
    if (!comment) return res.status(404).render("pages/404");

    const isOwner = comment.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin)
      return res.status(403).send("Yetkiniz yok.");

    res.render("pages/yorumDuzenle", {
      comment,
      postId: req.params.postId,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    logger.error("YORUM DÜZENLE (GET) ERROR:", err);
    res.status(500).send("Yorum düzenleme sayfası açılırken hata oluştu");
  }
});
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
      csrfToken: req.csrfToken(),       // 🔥 BUNU EKLEDİK
      error: req.query.error || null,
      success: req.query.success || null,
    });
  } catch (err) {
    logger.error("BLOG DETAY ERROR:", err);
    res.status(500).send("Hata oluştu");
  }
});

export default blogs;
