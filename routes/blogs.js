import express from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import cloudinary from "../helpers/cloudinary.js";
import { uploadBuffer } from "../helpers/cloudinaryUpload.js";

const blogs = express.Router();

/* ================================
   BLOG OLUŞTURMA
================================ */
blogs.get("/olustur", auth, (req, res) => {
  res.render("pages/blogOlustur");
});

blogs.post("/olustur", auth, upload.array("images", 5), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.redirect("/blog/olustur?error=Başlık+ve+içerik+zorunludur");
    }

    const uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBuffer(file.buffer, "blog_images");

        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    await Post.create({
      user_id: req.session.userId,
      username: req.session.username,
      title,
      content,
      images: uploadedImages,
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

    if (
      post.user_id.toString() !== req.session.userId &&
      req.session.role !== "admin"
    ) {
      return res.status(403).send("Yetkiniz yok.");
    }

    res.render("pages/blogDuzenle", { post });
  } catch (err) {
    console.error(err);
    res.status(500).send("Hata oluştu");
  }
});

/* ================================
   BLOG DÜZENLE (POST)
================================ */
blogs.post(
  "/:id/duzenle",
  auth,
  upload.array("newImages", 5),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).send("Blog bulunamadı");

      if (
        post.user_id.toString() !== req.session.userId &&
        req.session.role !== "admin"
      ) {
        return res.status(403).send("Yetkiniz yok.");
      }

      post.title = req.body.title;
      post.content = req.body.content;

      const toDelete = req.body.deleteImages;
      if (toDelete) {
        const deleteArray = Array.isArray(toDelete) ? toDelete : [toDelete];

        for (const publicId of deleteArray) {
          await cloudinary.uploader.destroy(publicId);
        }

        post.images = post.images.filter(
          (img) => !deleteArray.includes(img.public_id)
        );
      }

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadBuffer(file.buffer, "blog_images");

          post.images.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }

      await post.save();
      res.redirect(`/blog/${post._id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Blog düzenlenirken hata oluştu");
    }
  }
);

/* ================================
   BLOG SİL
================================ */
blogs.post("/:id/sil", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).send("Blog bulunamadı");

    if (
      post.user_id.toString() !== req.session.userId &&
      req.session.role !== "admin"
    ) {
      return res.status(403).send("Bu blogu silemezsiniz.");
    }

    for (const img of post.images) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {}
    }

    await Post.findByIdAndDelete(req.params.id);

    res.redirect("/blog");
  } catch (err) {
    console.error(err);
    res.status(500).send("Blog silinirken hata oluştu");
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
      user_id: req.session.userId,
      username: req.session.username,
      content,
    });

    res.redirect(`/blog/${post._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Yorum eklenirken hata oluştu");
  }
});

/* ================================
   YORUM SİL
================================ */
blogs.post("/:postId/yorum/:commentId/sil", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).send("Yorum bulunamadı.");

    if (comment.user_id.toString() !== req.session.userId) {
      return res.status(403).send("Bu yorumu silemezsiniz.");
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.redirect(`/blog/${req.params.postId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Yorum silinirken hata oluştu.");
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

    res.render("pages/blogDetay", {
      post,
      comments,
      isAuth: !!req.session.userId,
      currentUserId: req.session.userId,
      currentUsername: req.session.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Hata oluştu");
  }
});

export default blogs;
