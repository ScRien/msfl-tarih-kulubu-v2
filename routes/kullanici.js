import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const userRouter = express.Router();

/* ============================================================
   KAYIT OL (GET)
============================================================ */
userRouter.get("/kayitOl", (req, res) => {
  res.render("pages/kayitOl", {
    error: null,
  });
});

/* ============================================================
   KAYIT OL (POST)
============================================================ */
userRouter.post("/kayitOl", async (req, res) => {
  try {
    let { username, email, password, password2, name, surname } = req.body;

    // Temizlik
    username = username?.trim();
    email = email?.trim().toLowerCase();
    name = name?.trim();
    surname = surname?.trim();

    // -> Zorunlu alanlar
    if (!username || !email || !password || !password2 || !name || !surname) {
      return res.render("pages/kayitOl", {
        error: "Lütfen tüm alanları doldurun.",
      });
    }

    // -> Kullanıcı adında boşluk olamaz
    if (username.includes(" ")) {
      return res.render("pages/kayitOl", {
        error: "Kullanıcı adı boşluk içeremez.",
      });
    }

    // -> Şifre kontrolü
    if (password !== password2) {
      return res.render("pages/kayitOl", {
        error: "Şifreler eşleşmiyor.",
      });
    }

    // -> Email / username daha önce alınmış mı?
    const exists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (exists) {
      return res.render("pages/kayitOl", {
        error: "Bu email veya kullanıcı adı zaten kayıtlı.",
      });
    }

    // -> Şifre hash
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
      name,
      surname,
    });

    // Oturum aç
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    req.session.save(() => {
      res.redirect("/");
    });
  } catch (err) {
    console.error("Kayıt hatası:", err);
    return res.render("pages/kayitOl", {
      error: "Beklenmeyen bir hata oluştu.",
    });
  }
});

/* ============================================================
   OTURUM AÇ (GET)
============================================================ */
userRouter.get("/oturumAc", (req, res) => {
  res.render("pages/oturumAc", {
    error: null,
    success: req.query.success || null,
  });
});

/* ============================================================
   OTURUM AÇ (POST)
============================================================ */
userRouter.post("/oturumAc", async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username?.trim();

    if (!username || !password) {
      return res.render("pages/oturumAc", {
        error: "Kullanıcı adı ve şifre gerekli.",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.render("pages/oturumAc", {
        error: "Kullanıcı bulunamadı.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("pages/oturumAc", {
        error: "Şifre hatalı.",
      });
    }

    // Oturum
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    req.session.save(() => {
      res.redirect("/");
    });
  } catch (err) {
    console.error("Giriş hatası:", err);
    return res.render("pages/oturumAc", {
      error: "Bir hata oluştu.",
    });
  }
});

/* ============================================================
   ÇIKIŞ
============================================================ */
userRouter.get("/cikis", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default userRouter;
