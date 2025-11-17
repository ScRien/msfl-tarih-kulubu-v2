import express from "express";

const legalRouter = express.Router();

legalRouter.get("/kvkk", (req, res) => {
  res.render("pages/legal/kvkk");
});

legalRouter.get("/gizlilik", (req, res) => {
  res.render("pages/legal/gizlilik");
});

legalRouter.get("/kullanim-sartlari", (req, res) => {
  res.render("pages/legal/kullanim-sartlari");
});

export default legalRouter;
