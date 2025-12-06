import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter.js";

import {
  registerValidation,
  loginValidation,
} from "../middlewares/validators.js";

const userRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "jwt_super_secret_123";
const isProd = process.env.NODE_ENV === "production";

// ================================
// JWT COOKIE
// ================================
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
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

/* ================================
   KAYIT OL GET
================================ */
userRouter.get("/kayitOl", (req, res) => {
  res.render("pages/kayitOl", {
    error: null,
    username: "",
    email: "",
    name: "",
    surname: "",
  });
});

/* ================================
   KAYIT OL POST (Tam Düzeltilmiş)
================================ */
userRouter.post(
  "/kayitOl",
  registerLimiter, // 1) önce rate limit
  (req, res, next) => {
    req.validationErrorView = "pages/kayitOl";
    req.validationErrorData = req.body;
    next();
  },
  registerValidation, // 2) sonra validation
  async (req, res) => {
    try {
      let username = req.body.username.trim();
      let email = req.body.email.trim().toLowerCase();
      let name = req.body.name.trim();
      let surname = req.body.surname.trim();
      const password = req.body.password;

      // Benzersizlik
      const exists = await User.findOne({
        $or: [{ username }, { email }],
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

        // ✅ KVKK ve izinler
        serviceDataUsage: true,
        analyticsCookies: true,
        personalizationCookies: true,
        personalizedContent: true,
      });

      setAuthCookie(res, user);
      return res.redirect("/");
    } catch (err) {
      console.error("Kayıt hatası:", err);
      return res.render("pages/kayitOl", {
        error: "Beklenmeyen bir hata oluştu.",
      });
    }
  }
);

/* ================================
   OTURUM AÇ GET
================================ */
userRouter.get("/oturumAc", (req, res) => {
  res.render("pages/oturumAc", {
    error: req.query.error || null,
    success: req.query.success || null,
  });
});

/* ================================
   OTURUM AÇ POST
================================ */
userRouter.post(
  "/oturumAc",
  loginLimiter,
  (req, res, next) => {
    req.validationErrorView = "pages/oturumAc";
    req.validationErrorData = {};
    next();
  },
  loginValidation,
  async (req, res) => {
    try {
      const username = req.body.username.trim();
      const password = req.body.password;

      const user = await User.findOne({ username });
      if (!user)
        return res.render("pages/oturumAc", {
          error: "Kullanıcı adı veya şifre hatalı.",
        });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok)
        return res.render("pages/oturumAc", {
          error: "Kullanıcı adı veya şifre hatalı.",
        });

      setAuthCookie(res, user);
      return res.redirect("/");
    } catch (err) {
      console.error(err);
      return res.render("pages/oturumAc", {
        error: "Bir hata oluştu.",
      });
    }
  }
);

/* ================================
   ÇIKIŞ
================================ */
userRouter.get("/cikis", (req, res) => {
  res.clearCookie("auth_token", {
    sameSite: "lax",
    secure: isProd,
  });
  return res.redirect("/");
});

export default userRouter;
