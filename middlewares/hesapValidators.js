import { body } from "express-validator";
import { handleValidationErrors } from "./validators.js";

/* ============================================================
   PROFİL BİLGİLERİ VALIDATION
============================================================ */
export const profileValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("İsim 2-50 karakter arasında olmalıdır"),

  body("surname")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Soyisim 2-50 karakter arasında olmalıdır"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Biyografi en fazla 500 karakter olabilir"),

  handleValidationErrors,
];

/* ============================================================
   SOSYAL MEDYA VALIDATION (URL ZORLAMAZ)
============================================================ */
export const socialValidation = [
  body("instagram").optional().trim().isLength({ max: 100 }),
  body("x").optional().trim().isLength({ max: 100 }),
  body("github").optional().trim().isLength({ max: 100 }),
  body("youtube").optional().trim().isLength({ max: 100 }),
  body("website").optional().trim().isLength({ max: 200 }),

  handleValidationErrors,
];
