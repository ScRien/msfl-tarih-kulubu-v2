import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  role: { type: String, default: "user" },
  date: { type: Date, default: Date.now },

  /* PROFIL FOTOĞRAF */
  avatar: {
    type: String,
    default: "/img/default-avatar.png",
  },
  avatarPublicId: String,

  coverPhoto: {
    type: String,
    default: "/img/default-cover.jpg",
  },
  coverPublicId: String,

  /* SOSYAL MEDYA */
  social: {
    instagram: { type: String, default: "" },
    x: { type: String, default: "" },
    github: { type: String, default: "" },
    youtube: { type: String, default: "" },
    website: { type: String, default: "" },
  },

  /* BIYOGRAFI */
  bio: { type: String, default: "" },

  /* HESAP AYARLARI */
  analyticsCookies: { type: Boolean, default: false },
  personalizationCookies: { type: Boolean, default: false },
  serviceDataUsage: { type: Boolean, default: false },
  personalizedContent: { type: Boolean, default: false },

  resetCode: { type: String, default: null },
  resetCodeExpires: { type: Number, default: null },
});

const User = mongoose.model("User", UserSchema);
export default User;
