import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const userRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "jwt_super_secret_123";
const isProd = process.env.NODE_ENV === "production";

function setAuthCookie(res, user) {
  const token = jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
  });
}

/* ========================================
   KAYIT OL (GET)
======================================== */
userRouter.get("/kayitOl", (req, res) => {
  res.render("pages/kayitOl", {
    error: null,
  });
});

/* ========================================
   KAYIT OL (POST)
======================================== */
userRouter.post("/kayitOl", async (req, res) => {
  try {
    let { username, email, password, password2, name, surname } = req.body;

    username = username?.trim();
    email = email?.trim().toLowerCase();
    name = name?.trim();
    surname = surname?.trim();

    if (!username || !email || !password || !password2 || !name || !surname) {
      return res.render("pages/kayitOl", {
        error: "Lütfen tüm alanları doldurun.",
        username,
        email,
        name,
        surname,
      });
    }

    if (username.includes(" ")) {
      return res.render("pages/kayitOl", {
        error: "Kullanıcı adı boşluk içeremez.",
        username,
        email,
        name,
        surname,
      });
    }

    if (password !== password2) {
      return res.render("pages/kayitOl", {
        error: "Şifreler eşleşmiyor.",
        username,
        email,
        name,
        surname,
      });
    }

    const exists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (exists) {
      return res.render("pages/kayitOl", {
        error: "Bu email veya kullanıcı adı zaten kayıtlı.",
        username,
        email,
        name,
        surname,
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

    // JWT cookie
    setAuthCookie(res, user);

    return res.redirect("/");
  } catch (err) {
    console.error("Kayıt hatası:", err);
    return res.render("pages/kayitOl", {
      error: "Beklenmeyen bir hata oluştu.",
    });
  }
});

/* ========================================
   OTURUM AÇ (GET)
======================================== */
userRouter.get("/oturumAc", (req, res) => {
  res.render("pages/oturumAc", {
    error: req.query.error || null,
    success: req.query.success || null,
  });
});

/* ========================================
   OTURUM AÇ (POST)
======================================== */
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

    // JWT cookie
    setAuthCookie(res, user);

    return res.redirect("/");
  } catch (err) {
    console.error("Giriş hatası:", err);
    return res.render("pages/oturumAc", {
      error: "Bir hata oluştu.",
    });
  }
});

/* ========================================
   ÇIKIŞ
======================================== */
userRouter.get("/cikis", (req, res) => {
  res.clearCookie("auth_token", {
    sameSite: "lax",
    secure: isProd,
  });

  return res.redirect("/");
});

export default userRouter;
