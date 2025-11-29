import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  role: { type: String, default: "user" },
  date: { type: Date, default: Date.now },

  /* PROFİL FOTOĞRAF */
  avatar: {
    url: { type: String, default: "" },
    fileId: { type: String, default: "" },
    provider: {
      type: String,
      default: "imagekit",
    },
  },

  /* KAPAK FOTOĞRAF */
  coverImage: {
    url: { type: String, default: "" },
    fileId: { type: String, default: "" },
    provider: {
      type: String,
      default: "imagekit",
    },
  },

  /* SOSYAL MEDYA */
  social: {
    instagram: { type: String, default: "" },
    x: { type: String, default: "" },
    github: { type: String, default: "" },
    youtube: { type: String, default: "" },
    website: { type: String, default: "" },
  },

  /* BIYOGRAFİ */
  bio: { type: String, default: "" },

  /* HESAP AYARLARI */
  analyticsCookies: { type: Boolean, default: false },
  personalizationCookies: { type: Boolean, default: false },
  serviceDataUsage: { type: Boolean, default: false },
  personalizedContent: { type: Boolean, default: false },

  /* ŞİFRE SIFIRLAMA */
  resetCode: { type: String, default: null },
  resetCodeExpires: { type: Date, default: null },
});

const User = mongoose.model("User", UserSchema);
export default User;
