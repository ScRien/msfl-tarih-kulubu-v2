import rateLimit from "express-rate-limit";

// Genel API limiti
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına 100 istek
  message:
    "Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Login limiti (daha katı)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // IP başına 5 deneme
  message: "Çok fazla giriş denemesi. Lütfen 15 dakika bekleyin.",
  skipSuccessfulRequests: true, // Başarılı girişleri sayma
});

// Register limiti
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // IP başına 3 kayıt
  message: "Çok fazla kayıt denemesi. Lütfen 1 saat bekleyin.",
});

// Password reset limiti
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 3, // IP başına 3 deneme
  message: "Çok fazla şifre sıfırlama talebi. Lütfen 15 dakika bekleyin.",
});

// Blog oluşturma limiti
export const blogCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10, // Kullanıcı başına 10 blog
  message: "Çok fazla blog oluşturma denemesi. Lütfen 1 saat bekleyin.",
});

// Yorum limiti
export const commentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  max: 5, // 5 yorum
  message: "Çok hızlı yorum yazıyorsunuz. Lütfen yavaşlayın.",
});
