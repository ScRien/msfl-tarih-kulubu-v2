import express from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import auth from "../middlewares/auth.js";
import logger from "../helpers/logger.js";
import imagekit from "../helpers/imagekit.js";

const blogs = express.Router();

/* ============================================================
   BLOG OLUŞTUR (GET)
   Frontend: blogOlustur.handlebars
============================================================ */
blogs.get("/olustur", auth, (req, res) => {
  res.render("pages/blogOlustur", {
    csrfToken: req.csrfToken(),
    error: req.query.error || null,
    success: req.query.success || null,
  });
});

/* ============================================================
   BLOG OLUŞTUR (POST)
============================================================ */
blogs.post("/olustur", auth, async (req, res) => {
  try {
    const { title, content, imageUrls } = req.body;

    let images = [];
    if (imageUrls) {
      try {
        const parsed = JSON.parse(imageUrls);
        if (Array.isArray(parsed)) {
          images = parsed.filter((img) => img?.url && img?.fileId);
        }
      } catch (e) {
        logger.warn("imageUrls JSON parse error", e);
      }
    }

    await Post.create({
      user_id: req.user.id,
      username: req.user.username,
      title,
      content,
      images,
    });

    return res.redirect("/blog?success=Blog+oluşturuldu");
  } catch (err) {
    logger.error("BLOG CREATE ERROR:", err);
    return res.redirect("/blog/olustur?error=Blog+oluşturulamadı");
  }
});

/* ============================================================
   BLOG DÜZENLE (GET)
============================================================ */
blogs.get("/duzenle/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id).lean();
  if (!post) return res.redirect("/blog?error=Blog+bulunamadı");

  if (post.user_id.toString() !== req.user.id && req.user.role !== "admin") {
    return res.redirect("/blog?error=Yetkiniz+yok");
  }

  return res.render("pages/blogDuzenle", {
    post,
    csrfToken: req.csrfToken(),
  });
});

/* ============================================================
   BLOG DÜZENLE (POST)
============================================================ */
blogs.post("/duzenle/:id", auth, async (req, res) => {
  console.log("👉 DELETE IMAGES RAW:", req.body.deleteImages);
  console.log("👉 NEW IMAGES RAW:", req.body.newImagesJson);
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect("/blog?error=Blog+bulunamadı");

    if (post.user_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.redirect("/blog?error=Yetkiniz+yok");
    }

    const { title, content, deleteImages, newImagesJson } = req.body;

    let images = Array.isArray(post.images) ? [...post.images] : [];

    // silinecek görseller
    if (deleteImages) {
      try {
        const list = JSON.parse(deleteImages); // ["fileId1", "fileId2", ...]
        if (Array.isArray(list)) {
          images = images.filter((img) => {
            const fid = img.fileId || null;
            const url = img.url || null;
            // fileId varsa fileId'den, yoksa url'den sil
            return !list.includes(fid) && !list.includes(url);
          });
        }
      } catch (e) {
        logger.warn("deleteImages JSON parse error", e);
      }
    }

    // yeni eklenenler
    if (newImagesJson) {
      try {
        const parsed = JSON.parse(newImagesJson);
        if (Array.isArray(parsed)) {
          images = images.concat(parsed.filter((i) => i?.url));
        }
      } catch (e) {
        logger.warn("newImagesJson JSON parse error", e);
      }
    }

    post.title = title;
    post.content = content;
    post.images = images;

    await post.save();
    return res.redirect(`/blog/${post._id}`);
  } catch (err) {
    logger.error("BLOG UPDATE ERROR:", err);
    return res.redirect("/blog?error=Güncelleme+başarısız");
  }
});

/* ============================================================
   BLOG SİL (GÖRSELLERLE BİRLİKTE)
============================================================ */
blogs.post("/:id/sil", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect("/blog?error=Blog+bulunamadı");

    if (post.user_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.redirect("/blog?error=Yetkiniz+yok");
    }

    /* === TÜM GÖRSELLERİ IMAGEKIT'TEN SİL === */
    for (const img of post.images || []) {
      if (img.fileId) {
        try {
          await imagekit.deleteFile(img.fileId);
        } catch (err) {
          console.error("ImageKit delete error:", err.message);
        }
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.redirect("/blog?success=Blog+silindi");
  } catch (err) {
    logger.error("BLOG DELETE ERROR:", err);
    return res.redirect("/blog?error=Silinemedi");
  }
});

/* ============================================================
   BLOG DETAY
============================================================ */
blogs.get("/:id", async (req, res) => {
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
    isOwner,
    isAdmin,
    csrfToken: req.csrfToken(),
  });
});

/* ============================================================
   YORUM EKLE
============================================================ */
blogs.post("/:id/yorum", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.redirect("/blog");

  await Comment.create({
    post_id: post._id,
    user_id: req.user.id,
    username: req.user.username,
    content: req.body.content.trim(),
  });

  res.redirect(`/blog/${post._id}`);
});

/* ============================================================
   YORUM SİL
============================================================ */
blogs.post("/:postId/yorum/:commentId/sil", auth, async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.redirect(`/blog/${req.params.postId}`);

  if (comment.user_id.toString() !== req.user.id && req.user.role !== "admin") {
    return res.redirect(`/blog/${req.params.postId}`);
  }

  await Comment.findByIdAndDelete(req.params.commentId);
  res.redirect(`/blog/${req.params.postId}`);
});

export default blogs;
