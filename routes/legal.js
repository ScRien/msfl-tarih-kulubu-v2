import express from "express";

const legalRouter = express.Router();

legalRouter.get("/acik-riza-metni", (req, res) => {
  res.render("pages/legal/acik-riza-metni");
});

legalRouter.get("/gizlilik-politikasi", (req, res) => {
  res.render("pages/legal/gizlilik-politikasi");
});

legalRouter.get("/kullanim-sartlari", (req, res) => {
  res.render("pages/legal/kullanim-sartlari");
});

export default legalRouter;
