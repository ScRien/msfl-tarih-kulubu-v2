import express from "express";
import SupportMessage from "../models/SupportMessage.js";

const yardimDestekRoute = express.Router();

/* SAYFA */
yardimDestekRoute.get("/", (req, res) => {
  res.render("pages/yardimDestek", {
    csrfToken: req.csrfToken ? req.csrfToken() : "",
    success: req.query.success || null,
    error: req.query.error || null,
    isAuth: !!req.user,
    currentUsername: req.user?.username || null,
  });
});

/* FORM SUBMIT */
yardimDestekRoute.post("/", async (req, res) => {
  try {
    const { name, email, topic, message } = req.body;

    if (!name || !email || !message) {
      return res.redirect("/yardim-destek?error=Zorunlu+alanlar+eksik");
    }

    await SupportMessage.create({
      name: name?.trim() || null,
      email: email.trim(),
      topic,
      message: message.trim(),
      user_id: req.user?.id || null,
    });

    return res.redirect("/yardim-destek?success=Mesajınız+alındı");
  } catch (err) {
    return res.redirect("/yardim-destek?error=Bir+hata+oluştu");
  }
});

export default yardimDestekRoute;
