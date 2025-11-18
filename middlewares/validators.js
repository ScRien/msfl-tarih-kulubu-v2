import { body, validationResult } from "express-validator";

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return res.render(req.validationErrorView || "pages/404", {
      error: errorMessages.join(", "),
      ...req.validationErrorData,
    });
  }
  next();
};

// Kayıt validasyonu
export const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 24 })
    .withMessage("Kullanıcı adı 3-24 karakter olmalıdır")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir")
    .custom((value) => {
      if (value.includes(" ")) {
        throw new Error("Kullanıcı adı boşluk içeremez");
      }
      return true;
    }),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Geçerli bir email adresi giriniz"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Şifre en az 8 karakter olmalıdır")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir"
    ),

  body("password2").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Şifreler eşleşmiyor");
    }
    return true;
  }),

  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Ad 2-50 karakter olmalıdır")
    .matches(/^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/)
    .withMessage("Ad sadece harf içerebilir"),

  body("surname")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Soyad 2-50 karakter olmalıdır")
    .matches(/^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/)
    .withMessage("Soyad sadece harf içerebilir"),

  handleValidationErrors,
];

// Login validasyonu
export const loginValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Kullanıcı adı gereklidir")
    .isLength({ min: 3, max: 24 })
    .withMessage("Geçersiz kullanıcı adı"),

  body("password")
    .notEmpty()
    .withMessage("Şifre gereklidir")
    .isLength({ min: 8 })
    .withMessage("Geçersiz şifre"),

  handleValidationErrors,
];

// Blog oluşturma validasyonu
export const blogValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Başlık 5-200 karakter olmalıdır")
    .matches(/^[a-zA-Z0-9ğüşöçıİĞÜŞÖÇ\s\-:,!?.'"()]+$/)
    .withMessage("Başlık geçersiz karakterler içeriyor"),

  body("content")
    .trim()
    .isLength({ min: 50, max: 10000 })
    .withMessage("İçerik 50-10000 karakter olmalıdır"),

  handleValidationErrors,
];

// Yorum validasyonu
export const commentValidation = [
  body("content")
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage("Yorum 3-500 karakter olmalıdır")
    .custom((value) => {
      // Küfür filtreleme (basit örnek)
      const badWords = ["küfür1", "küfür2"]; // Gerçek liste çok daha uzun olmalı
      const lowerValue = value.toLowerCase();
      for (const word of badWords) {
        if (lowerValue.includes(word)) {
          throw new Error("Yorum uygunsuz içerik barındırıyor");
        }
      }
      return true;
    }),

  handleValidationErrors,
];

// Email validasyonu
export const emailValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Geçerli bir email adresi giriniz"),

  handleValidationErrors,
];

// Şifre değiştirme validasyonu
export const passwordChangeValidation = [
  body("password1")
    .isLength({ min: 8 })
    .withMessage("Şifre en az 8 karakter olmalıdır")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir"
    ),

  body("password2").custom((value, { req }) => {
    if (value !== req.body.password1) {
      throw new Error("Şifreler eşleşmiyor");
    }
    return true;
  }),

  handleValidationErrors,
];