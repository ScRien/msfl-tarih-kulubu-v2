import { body, validationResult } from "express-validator";

/* ============================================================
   GENEL ERROR HANDLER
============================================================ */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);

    // Eğer middleware çağırmadan önce view belirlediysek oraya dön
    if (req.validationErrorView) {
      return res.render(req.validationErrorView, {
        error: messages.join(", "),
        ...req.validationErrorData,
      });
    }

    // Eğer belirlenmemişse 400 döner
    return res.status(400).send(messages.join(", "));
  }

  next();
};

/* ============================================================
   REGISTER VALIDATION
============================================================ */
export const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 24 })
    .withMessage("Kullanıcı adı 3-24 karakter olmalıdır")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Kullanıcı adı sadece harf, rakam ve _ içerebilir"),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Geçerli bir email giriniz"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Şifre en az 8 karakter olmalıdır")
    .matches(/^(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Şifre bir büyük harf ve bir rakam içermelidir"),

  body("password2").custom((v, { req }) => {
    if (v !== req.body.password) throw new Error("Şifreler eşleşmiyor");
    return true;
  }),

  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("İsim geçersiz"),

  body("surname")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Soyisim geçersiz"),

  handleValidationErrors,
];

/* ============================================================
   LOGIN VALIDATION
============================================================ */
export const loginValidation = [
  body("username").trim().notEmpty().withMessage("Kullanıcı adı gerekli"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Şifre en az 8 karakter olmalı"),
  handleValidationErrors,
];

/* ============================================================
   EMAIL VALIDATION
============================================================ */
export const emailValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Geçersiz email"),
  handleValidationErrors,
];

/* ============================================================
   PASSWORD CHANGE VALIDATION
============================================================ */
export const passwordChangeValidation = [
  body("password1")
    .isLength({ min: 8 })
    .withMessage("Şifre en az 8 karakter olmalı")
    .matches(/^(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Şifre büyük harf ve rakam içermeli"),

  body("password2").custom((v, { req }) => {
    if (v !== req.body.password1)
      throw new Error("Şifreler eşleşmiyor");
    return true;
  }),

  handleValidationErrors,
];

/* ============================================================
   BLOG VALIDATION
============================================================ */
export const blogValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Başlık 5-200 karakter olmalıdır"),

  body("content")
    .trim()
    .isLength({ min: 50, max: 10000 })
    .withMessage("İçerik 50-10000 karakter arasında olmalıdır"),

  handleValidationErrors,
];

/* ============================================================
   COMMENT VALIDATION
============================================================ */
export const commentValidation = [
  body("content")
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage("Yorum 3-500 karakter arasında olmalıdır"),

  handleValidationErrors,
];
