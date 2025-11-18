import express from "express";
import User from "../models/User.js";
import { sendMail } from "../helpers/mail.js";
import { verificationMailTemplate } from "../helpers/mailTemplates.js";
import { passwordResetLimiter } from "../middlewares/rateLimiter.js";
import {
  emailValidation,
  passwordChangeValidation,
} from "../middlewares/validators.js";
import crypto from "crypto";
import logger from "../helpers/logger.js";

const sifreUnuttumRouter = express.Router();

/* ============================================================
   1) SAYFA GET
============================================================ */
sifreUnuttumRouter.get("/", (req, res) => {
  res.render("pages/sifreUnuttum", {
    error: req.query.error || null,
    success: req.query.success || null,
    showVerify: req.query.showVerify || null,
    showNewPass: req.query.showNewPass || null,
    token: req.query.token || null,
  });
});

/* ============================================================
   2) MAİL → GÜVENLİ TOKEN GÖNDER
============================================================ */
sifreUnuttumRouter.post(
  "/kod",
  passwordResetLimiter,
  emailValidation,
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // ✅ GÜVENLİK: Email yoksa da başarılı mesaj göster (email enumeration önleme)
        logger.warn("Şifre sıfırlama - Mevcut olmayan email:", { email });
        return res.redirect(
          "/sifre-unuttum?success=Eğer+email+kayıtlıysa+kod+gönderildi"
        );
      }

      // ✅ Kriptografik olarak güvenli token oluştur
      const resetToken = crypto.randomBytes(32).toString("hex");

      // ✅ Token'ı hash'leyerek DB'ye kaydet (rainbow table saldırılarına karşı)
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetCode = hashedToken;
      user.resetCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 saat
      await user.save();

      // ✅ 6 haneli kod yerine URL'de token kullan
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/sifre-unuttum?token=${resetToken}&showNewPass=1`;

      const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <title>Şifre Sıfırlama</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #731919;">Şifre Sıfırlama Talebi</h2>
          <p>Merhaba ${user.name} ${user.surname},</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
          <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 30px; background: #e52b2b; color: white; text-decoration: none; border-radius: 5px;">
            Şifremi Sıfırla
          </a>
          <p style="color: #666; font-size: 14px;">Bu link <strong>1 saat</strong> geçerlidir.</p>
          <p style="color: #666; font-size: 14px;">Bu işlemi siz yapmadıysanız, lütfen bu maili dikkate almayın.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">MSFL Tarih Kulübü</p>
        </div>
      </body>
      </html>
      `;

      const ok = await sendMail(email, "Şifre Sıfırlama Talebi", html);

      if (!ok) {
        logger.error("Şifre sıfırlama maili gönderilemedi:", { email });
        return res.redirect("/sifre-unuttum?error=Mail+gönderilemedi");
      }

      logger.info("Şifre sıfırlama maili gönderildi:", {
        email,
        ip: req.ip,
      });

      return res.redirect(
        "/sifre-unuttum?success=Şifre+sıfırlama+linki+mailinize+gönderildi"
      );
    } catch (err) {
      logger.error("Şifre sıfırlama kod gönderme hatası:", err);
      return res.redirect("/sifre-unuttum?error=Bir+hata+oluştu");
    }
  }
);

/* ============================================================
   3) TOKEN DOĞRULAMA (Otomatik - URL'den)
============================================================ */
sifreUnuttumRouter.get("/dogrula/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Token'ı hash'le
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // DB'de ara
    const user = await User.findOne({
      resetCode: hashedToken,
      resetCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn("Geçersiz/süresi dolmuş şifre sıfırlama token'ı:", {
        token: hashedToken.substring(0, 10),
      });
      return res.redirect(
        "/sifre-unuttum?error=Geçersiz+veya+süresi+dolmuş+link"
      );
    }

    // Token geçerli, yeni şifre sayfasına yönlendir
    return res.redirect(
      `/sifre-unuttum?showNewPass=1&token=${token}&success=Link+doğrulandı`
    );
  } catch (err) {
    logger.error("Token doğrulama hatası:", err);
    return res.redirect("/sifre-unuttum?error=Bir+hata+oluştu");
  }
});

/* ============================================================
   4) YENİ ŞİFRE KAYDET
============================================================ */
sifreUnuttumRouter.post(
  "/yeni-sifre",
  passwordChangeValidation,
  async (req, res) => {
    try {
      const { token, password1 } = req.body;

      if (!token) {
        return res.redirect("/sifre-unuttum?error=Geçersiz+işlem");
      }

      // Token'ı hash'le
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Kullanıcıyı bul
      const user = await User.findOne({
        resetCode: hashedToken,
        resetCodeExpires: { $gt: Date.now() },
      });

      if (!user) {
        logger.warn("Şifre sıfırlama - geçersiz token:", {
          token: hashedToken.substring(0, 10),
        });
        return res.redirect(
          "/sifre-unuttum?error=Geçersiz+veya+süresi+dolmuş+link&showNewPass=1&token=" +
            token
        );
      }

      // Yeni şifreyi hash'le
      const bcrypt = await import("bcrypt");
      const hashed = await bcrypt.hash(password1, 12); // 12 round = daha güvenli

      // Şifreyi güncelle ve token'ı temizle
      user.password = hashed;
      user.resetCode = null;
      user.resetCodeExpires = null;
      await user.save();

      logger.info("Şifre başarıyla sıfırlandı:", {
        userId: user._id,
        email: user.email,
      });

      return res.redirect(
        "/kullanici/oturumAc?success=Şifreniz+başarıyla+güncellendi"
      );
    } catch (err) {
      logger.error("Yeni şifre kaydetme hatası:", err);
      return res.redirect("/sifre-unuttum?error=Şifre+güncellenemedi");
    }
  }
);

export default sifreUnuttumRouter;