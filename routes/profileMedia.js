import express from "express";
import authApi from "../middlewares/authApi.js";
import User from "../models/User.js";
import imagekit from "../helpers/imagekit.js";

const profileMediaRouter = express.Router();

profileMediaRouter.post("/", authApi, async (req, res) => {
  try {
    const { type, url, fileId } = req.body;

    if (!["avatar", "cover"].includes(type)) {
      return res.status(400).json({ error: "Tip geçersiz" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    /* === AVATAR === */
    if (type === "avatar") {
      if (user.avatar?.fileId) {
        await imagekit.deleteFile(user.avatar.fileId).catch(() => {});
      }

      user.avatar = {
        url,
        fileId,
        provider: "imagekit",
      };
    }

    /* === COVER === */
    if (type === "cover") {
      if (user.coverImage?.fileId) {
        await imagekit.deleteFile(user.coverImage.fileId).catch(() => {});
      }

      user.coverImage = {
        url,
        fileId,
        provider: "imagekit",
      };
    }

    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload başarısız" });
  }
});

export default profileMediaRouter;
