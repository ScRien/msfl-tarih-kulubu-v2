import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const userRouter = express.Router();

/* ========================================
   KAYIT OL (GET)
======================================== */
userRouter.get("/kayitOl", (req, res) => {
  res.render("pages/kayitOl");
});

/* ========================================
   KAYIT OL (POST)
======================================== */
userRouter.post("/kayitOl", async (req, res) => {
  try {
    const { username, email, password, password2, name, surname } = req.body;

    if (password !== password2) {
      return res.render("pages/kayitOl", { error: "Şifreler eşleşmiyor." });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.render("pages/kayitOl", {
        error: "Bu kullanıcı adı veya email zaten mevcut.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
      name,
      surname,
    });

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("pages/kayitOl", { error: "Bir hata oluştu." });
  }
});

/* ========================================
   OTURUM AÇ (GET)
======================================== */
userRouter.get("/oturumAc", (req, res) => {
  res.render("pages/oturumAc");
});

/* ========================================
   OTURUM AÇ (POST)
======================================== */
userRouter.post("/oturumAc", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.render("pages/oturumAc", { error: "Kullanıcı bulunamadı." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("pages/oturumAc", { error: "Şifre hatalı." });
    }

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("pages/oturumAc", { error: "Bir hata oluştu." });
  }
});

/* ========================================
   ÇIKIŞ
======================================== */
userRouter.get("/cikis", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default userRouter;
