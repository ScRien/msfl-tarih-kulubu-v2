// app.js
import bodyParser from "body-parser";
import express from "express";
import router from "./routes/main.js";
import "dotenv/config";
import { create } from "express-handlebars";
import generateDate from "./helpers/generateDate.js";
import mongoose from "mongoose";
import blogs from "./routes/blogs.js";
import admin from "./routes/admin.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import eq from "./helpers/eq.js";
import kullaniciRouter from "./routes/kullanici.js";
import hesapRouter from "./routes/hesap.js";
import publicProfile from "./routes/publicProfile.js";
import handlebarsHelpers from "./helpers/handlebarsHelpers.js"; // helper’lar için import
import legalRouter from "./routes/legal.js";
import sifreUnuttumRouter from "./routes/sifreUnuttum.js";

const app = express();

// PORT/HOSTNAME BURADAN GİDİYOR – sadece Vercel veya server.js kullanacak

// MongoDB
await mongoose.connect(process.env.MONGO_URL);
console.log("MongoDB bağlantısı başarılı.");

// Cache kontrol
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Statik dosyalar
app.use(express.static("public"));

// ==== SESSION ====
app.use(
  session({
    secret: "tarih-kulubu-gizli",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 hafta
    },
  })
);

// Navbar için global template değişkenleri
app.use((req, res, next) => {
  res.locals.isAuth = !!req.session.userId;
  res.locals.currentUser = req.session.username || null;
  res.locals.currentUserId = req.session.userId || null;
  res.locals.currentRole = req.session.role || null;
  next();
});

// ==== HANDLEBARS ====
const hbs = create({
  defaultLayout: "main",
  partialsDir: ["views/partials"],
  helpers: { generateDate, eq },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

// helpers/handlebarsHelpers.js içinde zaten global register yapıyorsun,
// bu yüzden sadece import etmemiz yeterli (yukarıda import var).

hbs.handlebars.registerHelper("toString", function (value) {
  return value ? value.toString() : "";
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

// ==== BODY PARSER ====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 1) Kullanıcı
app.use("/kullanici", kullaniciRouter);

// 2) Hesap
app.use("/hesap", hesapRouter);

// 3) Şifre Unuttum
app.use("/sifre-unuttum", sifreUnuttumRouter);

// 4) Blog
app.use("/blog", blogs);

// 5) Admin
app.use("/admin", admin);

// 6) Statik sayfalar / Anasayfa
app.use("/", router);

// 7) Public profile
app.use("/", publicProfile);

// 8) KVKK / Gizlilik / Kullanım Şartları
app.use("/", legalRouter);

// 404
app.use((req, res) => {
  res.status(404).render("pages/404");
});

// *** EN ÖNEMLİ KISIM ***
export default app;
