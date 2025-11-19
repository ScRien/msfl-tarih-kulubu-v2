import express from "express";
import User from "../models/User.js";
import { sendMail } from "../helpers/mail.js";
import crypto from "crypto";
import logger from "../helpers/logger.js";
import {
  emailValidation,
  passwordChangeValidation,
} from "../middlewares/validators.js";
import { passwordResetLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

/* ============================================================
   1) Şifre Unuttum Sayfası
============================================================ */
router.get("/", (req, res) => {
  res.render("pages/sifreUnuttum", {
    error: req.query.error || null,
    success: req.query.success || null,
    showNewPass: req.query.showNewPass || null,
    token: req.query.token || null,
  });
});

/* ============================================================
   2) E-posta Gönderme — Token Üretme
============================================================ */
router.post(
  "/kod",
  // VALIDATION VIEW
  (req, res, next) => {
    req.validationErrorView = "pages/sifreUnuttum";
    req.validationErrorData = {}; // email alanı zaten çok basit
    next();
  },
  passwordResetLimiter,
  emailValidation,
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      // Email yoksa bile SUCCESS göster → güvenlik
      if (!user) {
        logger.warn("Şifre sıfırlama — olmayan email:", { email });
        return res.redirect(
          "/sifre-unuttum?success=Eğer+email+kayıtlıysa+sıfırlama+linki+gönderildi"
        );
      }

      // Güvenli token oluştur
      const resetToken = crypto.randomBytes(32).toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // DB'ye kaydet
      user.resetCode = hashedToken;
      user.resetCodeExpires = Date.now() + 60 * 60 * 1000; // 1 saat
      await user.save();

      // Link oluştur
      const resetLink = `${req.protocol}://${req.get(
        "host"
      )}/sifre-unuttum?token=${resetToken}&showNewPass=1`;

      const html = `
        <h2>Şifre Sıfırlama Talebi</h2>
        <p>Hesabınız için şifre sıfırlama bağlantısı:</p>
        <a href="${resetLink}">Şifremi Sıfırla</a>
        <p>Bu link 1 saat geçerlidir.</p>
      `;

      const ok = await sendMail(email, "Şifre Sıfırlama", html);

      if (!ok) {
        logger.error("Mail gönderilemedi:", { email });
        return res.redirect("/sifre-unuttum?error=Mail+gönderilemedi");
      }

      logger.info("Sıfırlama maili gönderildi", { email });

      return res.redirect(
        "/sifre-unuttum?success=Eğer+email+kayıtlıysa+link+gönderildi"
      );
    } catch (err) {
      logger.error("Şifre sıfırlama hata:", err);
      return res.redirect("/sifre-unuttum?error=Bir+hata+oluştu");
    }
  }
);

/* ============================================================
   3) Token Doğrulama — (URL ile)
============================================================ */
router.get("/dogrula/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetCode: hashed,
      resetCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(
        "/sifre-unuttum?error=Geçersiz+veya+süresi+dolmuş+link"
      );
    }

    return res.redirect(
      `/sifre-unuttum?success=Link+doğrulandı&showNewPass=1&token=${token}`
    );
  } catch (err) {
    logger.error("Token verify error:", err);
    return res.redirect("/sifre-unuttum?error=Bir+hata+oluştu");
  }
});

/* ============================================================
   4) Yeni Şifre Kaydet
============================================================ */
router.post(
  "/yeni-sifre",
  // VALIDATION VIEW
  (req, res, next) => {
    req.validationErrorView = "pages/sifreUnuttum";
    req.validationErrorData = {
      showNewPass: true,
      token: req.body.token,
    };
    next();
  },
  passwordChangeValidation,
  async (req, res) => {
    try {
      const { token, password1 } = req.body;

      if (!token) {
        return res.redirect("/sifre-unuttum?error=Geçersiz+işlem");
      }

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        resetCode: hashedToken,
        resetCodeExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.redirect(
          `/sifre-unuttum?error=Geçersiz+veya+süresi+dolmuş+link&showNewPass=1&token=${token}`
        );
      }

      const hashedPw = await (await import("bcrypt")).hash(password1, 12);

      user.password = hashedPw;
      user.resetCode = null;
      user.resetCodeExpires = null;
      await user.save();

      logger.info("Şifre sıfırlandı", { userId: user._id });

      return res.redirect(
        "/kullanici/oturumAc?success=Şifreniz+başarıyla+güncellendi"
      );
    } catch (err) {
      logger.error("Yeni şifre hata:", err);
      return res.redirect("/sifre-unuttum?error=Şifre+güncellenemedi");
    }
  }
);

export default router;
