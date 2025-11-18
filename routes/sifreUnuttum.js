import express from "express";
import User from "../models/User.js";
import { sendMail } from "../helpers/mail.js";
import { verificationMailTemplate } from "../helpers/mailTemplates.js";

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
    email: req.query.email || null, // emaili geri taşıyalım
  });
});

/* ============================================================
   2) MAİL → KOD GÖNDER (DB'ye kaydet)
============================================================ */
sifreUnuttumRouter.post("/kod", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.redirect("/sifre-unuttum?error=Bu+mail+kayıtlı+değil");
  }

  // 6 haneli kod
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Kod ve sona erme süresi (10 dk)
  user.resetCode = code;
  user.resetCodeExpires = new Date(Date.now() + 1000 * 60 * 10);
  await user.save();

  // Mail şablonu
  const html = verificationMailTemplate(`${user.name} ${user.surname}`, code);

  const ok = await sendMail(email, "Şifre Sıfırlama Kodunuz", html);
  if (!ok) {
    return res.redirect("/sifre-unuttum?error=Mail+gönderilemedi");
  }

  return res.redirect(
    `/sifre-unuttum?success=Kod+gönderildi&showVerify=1&email=${email}`
  );
});

/* ============================================================
   3) KOD DOĞRULAMA
============================================================ */
sifreUnuttumRouter.post("/kod-dogrula", async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.resetCode) {
    return res.redirect(
      `/sifre-unuttum?error=Kod+talep+edilmedi&showVerify=1&email=${email}`
    );
  }

  // Kod süresi dolmuş mu?
  if (user.resetCodeExpires < new Date()) {
    return res.redirect(
      `/sifre-unuttum?error=Kodun+süresi+doldu&showVerify=1&email=${email}`
    );
  }

  // Kod doğru mu?
  if (user.resetCode !== code.trim()) {
    return res.redirect(
      `/sifre-unuttum?error=Kod+yanlış&showVerify=1&email=${email}`
    );
  }

  // Kod doğru → yeni şifre sayfasına geç
  return res.redirect(
    `/sifre-unuttum?success=Kod+onaylandı&showNewPass=1&email=${email}`
  );
});

/* ============================================================
   4) YENİ ŞİFRE KAYDET
============================================================ */
sifreUnuttumRouter.post("/yeni-sifre", async (req, res) => {
  const { email, password1, password2 } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.resetCode) {
    return res.redirect("/sifre-unuttum?error=Yetkisiz+işlem");
  }

  if (!password1 || !password2) {
    return res.redirect(
      `/sifre-unuttum?error=Şifre+boş+olamaz&showNewPass=1&email=${email}`
    );
  }

  if (password1 !== password2) {
    return res.redirect(
      `/sifre-unuttum?error=Şifreler+eşleşmiyor&showNewPass=1&email=${email}`
    );
  }

  // Şifreyi hashle
  const bcrypt = await import("bcrypt");
  const hashed = await bcrypt.hash(password1, 10);

  // Şifreyi güncelle
  await User.findOneAndUpdate(
    { email },
    {
      password: hashed,
      resetCode: null,
      resetCodeExpires: null,
    }
  );

  return res.redirect(
    "/kullanici/oturumAc?success=Şifre+başarıyla+güncellendi"
  );
});

export default sifreUnuttumRouter;
