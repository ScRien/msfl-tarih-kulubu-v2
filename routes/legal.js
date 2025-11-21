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

// ===============================
// İLETİŞİM
// ===============================
legalRouter.get("/iletisim", (req, res) => {
  res.render("pages/legal/iletisim", {
    title: "İletişim",
  });
});

// ===============================
// SİTE HARİTASI
// ===============================
legalRouter.get("/site-haritasi", (req, res) => {
  res.render("pages/legal/site-haritasi", {
    title: "Site Haritası",
  });
});

export default legalRouter;
