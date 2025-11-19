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
blogs.get("/duzenle/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();

    if (!post) {
      return res.render("pages/blogDuzenle", {
        error: "Blog bulunamadı."
      });
    }

    // Post sahibi değilse erişemez
    if (post.user_id.toString() !== req.user.id) {
      return res.redirect("/blog?error=Bu+blogu+düzenleme+yetkin+yok");
    }

    return res.render("pages/blogDuzenle", {
      post,
      csrfToken: req.csrfToken()
    });

  } catch (err) {
    console.error("BLOG DÜZENLE GET HATASI:", err);
    return res.render("pages/blogDuzenle", {
      error: "Bir hata oluştu."
    });
  }
});

/* ============================================================
   BLOG DÜZENLE (POST)
============================================================ */
blogs.post("/duzenle/:id", auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.render("pages/blogDuzenle", {
        error: "Blog bulunamadı."
      });
    }

    if (post.user_id.toString() !== userId) {
      return res.redirect("/blog?error=Yetkin+yok");
    }

    const { title, content } = req.body;

    /* ------------------------
        1) Mevcut görselleri sil
    ------------------------- */
    let deleteList = req.body.deleteImages || [];
    if (!Array.isArray(deleteList)) deleteList = [deleteList];

    // Silinmeyecek görseller
    let newImages = post.images.filter(img => !deleteList.includes(img));

    /* ------------------------
        2) Yeni yüklenen Cloudinary görselleri
    ------------------------- */
    let uploadedImages = [];
    if (req.body.uploadedImages) {
      uploadedImages = JSON.parse(req.body.uploadedImages);
    }

    // Final görsel listesi:
    const finalImages = [...newImages, ...uploadedImages];

    /* ------------------------
        3) Güncelleme
    ------------------------- */
    post.title = title;
    post.content = content;
    post.images = finalImages;

    await post.save();

    return res.redirect(`/blog/${postId}?success=Blog+güncellendi`);

  } catch (err) {
    console.error("BLOG DÜZENLE POST HATASI:", err);
    return res.render("pages/blogDuzenle", {
      error: "Bir hata oluştu.",
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
