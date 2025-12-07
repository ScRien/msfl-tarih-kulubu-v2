import express from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import auth from "../middlewares/auth.js";
import ImageKit from "imagekit"; // Import ImageKit
import "dotenv/config";

const blogs = express.Router();

// ImageKit Ayarları (Backend işlemleri için)
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "SENIN_PUBLIC_KEY",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "SENIN_PRIVATE_KEY",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "SENIN_URL_ENDPOINT",
});

/* ============================================================
   BLOG OLUŞTUR (GET)
============================================================ */
blogs.get("/olustur", auth, (req, res) => {
  res.render("pages/blogOlustur", {
    csrfToken: req.csrfToken ? req.csrfToken() : "",
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
          images = parsed
            .filter((img) => img?.url && img?.fileId)
            .map((img) => ({
              url: img.url,
              fileId: img.fileId,
              provider: "imagekit",
            }));
        }
      } catch (e) {
        console.error("imageUrls JSON parse error:", e);
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
    console.error("BLOG CREATE ERROR:", err);
    return res.redirect("/blog/olustur?error=Blog+oluşturulurken+hata+oluştu");
  }
});

/* ============================================================
   BLOG DÜZENLE (GET)
============================================================ */
blogs.get("/duzenle/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.redirect("/blog?error=Blog+bulunamadı");

    if (post.user_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.redirect("/blog?error=Bu+işlem+için+yetkiniz+yok");
    }

    return res.render("pages/blogDuzenle", {
      post,
      csrfToken: req.csrfToken ? req.csrfToken() : "",
    });
  } catch (err) {
    return res.redirect("/blog?error=Hata");
  }
});

/* ============================================================
   BLOG DÜZENLE (POST)
============================================================ */
blogs.post("/duzenle/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect("/blog?error=Blog+bulunamadı");

    if (post.user_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.redirect("/blog?error=Yetkiniz+yok");
    }

    const { title, content } = req.body;
    const deleteImagesRaw = req.body.deleteImages || "[]";
    const newImagesRaw = req.body.newImagesJson || "[]";

    let currentImages = Array.isArray(post.images) ? [...post.images] : [];

    /* ---------- 1) Silinecek görseller (ImageKit'ten de sil) ---------- */
    let toDeleteIds = [];
    try {
      toDeleteIds = JSON.parse(deleteImagesRaw);
    } catch (e) {
      console.warn("deleteImages parse hatası", e);
    }

    if (Array.isArray(toDeleteIds) && toDeleteIds.length > 0) {
      // Önce listeden çıkar
      currentImages = currentImages.filter((img) => !toDeleteIds.includes(img.fileId));

      // Sonra Cloud'dan sil (Arkaplanda)
      toDeleteIds.forEach(async (fileId) => {
        try {
          await imagekit.deleteFile(fileId);
        } catch (err) {
          console.error(`Görsel silinemedi (${fileId}):`, err.message);
        }
      });
    }

    /* ---------- 2) Yeni eklenecek görseller ---------- */
    let newImages = [];
    try {
      const parsed = JSON.parse(newImagesRaw);
      if (Array.isArray(parsed)) newImages = parsed;
    } catch (e) {
      console.warn("newImagesJson parse hatası", e);
    }

    if (newImages.length) {
      const formattedNewImages = newImages
        .filter((i) => i?.url && i?.fileId)
        .map((i) => ({
          url: i.url,
          fileId: i.fileId,
          provider: "imagekit",
        }));
      
      currentImages = currentImages.concat(formattedNewImages);
    }

    // Veritabanını Güncelle
    post.title = title;
    post.content = content;
    post.images = currentImages;

    await post.save();

    return res.redirect(`/blog/${post._id}?success=Blog+güncellendi`);
  } catch (err) {
    console.error("BLOG UPDATE ERROR:", err);
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
    if (post.images && post.images.length > 0) {
        // Promise.all kullanarak paralel silme işlemi
        const deletePromises = post.images
            .filter(img => img.fileId)
            .map(img => imagekit.deleteFile(img.fileId).catch(e => console.error(e)));
        
        await Promise.all(deletePromises);
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post_id: req.params.id });

    return res.redirect("/blog?success=Blog+tamamen+silindi");
  } catch (err) {
    console.error("BLOG DELETE ERROR:", err);
    return res.redirect("/blog?error=Silme+işlemi+başarısız");
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
      isOwner,
      isAdmin,
      currentUsername: req.user?.username || null,
      csrfToken: req.csrfToken ? req.csrfToken() : "",
      success: req.query.success,
      error: req.query.error
    });
  } catch (err) {
    res.status(500).render("pages/500");
  }
});

/* ============================================================
   YORUM İŞLEMLERİ
============================================================ */
blogs.post("/:id/yorum", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect("/blog");

    await Comment.create({
      post_id: post._id,
      user_id: req.user.id,
      username: req.user.username,
      content: req.body.content.trim(),
    });
    res.redirect(`/blog/${post._id}#comments`);
  } catch(e) { res.redirect(`/blog/${req.params.id}?error=Yorum+eklenemedi`); }
});

blogs.post("/:postId/yorum/:commentId/sil", auth, async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);
    if(comment && (comment.user_id.toString() === req.user.id || req.user.role === "admin")) {
        await Comment.findByIdAndDelete(req.params.commentId);
    }
    res.redirect(`/blog/${req.params.postId}#comments`);
});

export default blogs;