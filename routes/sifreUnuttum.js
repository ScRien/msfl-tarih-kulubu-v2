import express from "express";
import User from "../models/User.js";
import { sendMail } from "../helpers/mail.js";

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
  });
});

/* ============================================================
   2) MAİL → KOD GÖNDER
============================================================ */
sifreUnuttumRouter.post("/kod", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.redirect("/sifre-unuttum?error=Bu+mail+kayıtlı+değil");
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  req.session.resetEmail = email;
  req.session.resetCode = code;
  req.session.save();

  const html = `
    <h2>Şifre Sıfırlama Kodunuz</h2>
    <p>Doğrulama Kodunuz: <b>${code}</b></p>
    <p>Bu kod 10 dakika geçerlidir.</p>
  `;

  const ok = await sendMail(email, "Doğrulama Kodunuz", html);

  if (!ok) {
    return res.redirect("/sifre-unuttum?error=Mail+gönderilemedi");
  }

  return res.redirect("/sifre-unuttum?success=Kod+gönderildi&showVerify=1");
});

/* ============================================================
   3) KOD DOĞRULAMA
============================================================ */
sifreUnuttumRouter.post("/kod-dogrula", async (req, res) => {
  const { code } = req.body;

  if (!req.session.resetCode) {
    return res.redirect("/sifre-unuttum?error=Kod+talep+edilmedi&showVerify=1");
  }

  if (code.trim() !== req.session.resetCode) {
    return res.redirect("/sifre-unuttum?error=Kod+yanlış&showVerify=1");
  }

  req.session.allowPasswordReset = true;
  req.session.save();

  return res.redirect("/sifre-unuttum?success=Kod+onaylandı&showNewPass=1");
});

/* ============================================================
   4) YENİ ŞİFRE KAYDET
============================================================ */
sifreUnuttumRouter.post("/yeni-sifre", async (req, res) => {
  if (!req.session.allowPasswordReset) {
    return res.redirect("/sifre-unuttum?error=Yetkisiz+işlem");
  }

  const { password1, password2 } = req.body;

  if (!password1 || !password2) {
    return res.redirect("/sifre-unuttum?error=Şifre+boş+olamaz&showNewPass=1");
  }

  if (password1 !== password2) {
    return res.redirect("/sifre-unuttum?error=Şifreler+eşleşmiyor&showNewPass=1");
  }

  const bcrypt = await import("bcrypt");
  const hashed = await bcrypt.hash(password1, 10);

  await User.findOneAndUpdate(
    { email: req.session.resetEmail },
    { password: hashed }
  );

  req.session.resetEmail = null;
  req.session.resetCode = null;
  req.session.allowPasswordReset = false;

  return res.redirect("/kullanici/oturumAc?success=Şifre+başarıyla+güncellendi");
});

export default sifreUnuttumRouter;
