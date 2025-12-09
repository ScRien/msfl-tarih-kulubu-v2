import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";

import { csrfProtection, addCsrfToken } from "./middlewares/csrf.js";
import jwtAuth from "./middlewares/jwtAuth.js";

import { eq } from "./helpers/eq.js";
import { generateDate } from "./helpers/generateDate.js";
import handlebarsHelpers from "./helpers/handlebarsHelpers.js";
import logger from "./helpers/logger.js";
import toString from "./helpers/toString.js";

import mainRoute from "./routes/main.js";
import blogRoute from "./routes/blog.js";
import kullaniciRoute from "./routes/kullanici.js";
import legalRoute from "./routes/legal.js";
import hesapRoute from "./routes/hesap.js";
import profileRoute from "./routes/profile.js";
import publicProfileRoute from "./routes/publicProfile.js";
import sifreUnuttumRoute from "./routes/sifreUnuttum.js";
import adminRoute from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";
import profileMediaRouter from "./routes/profileMedia.js";
import yardimDestekRoute from "./routes/yardimDestek.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

/* ========================================================
   1. VIEW ENGINE & STATIC FILES (EN BAŞA TAŞINDI)
======================================================== */
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    helpers: { eq, generateDate, toString, ...handlebarsHelpers },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

/* ========================================================
   2. DB BAĞLANTISI (VERCEL OPTİMİZASYONU)
   Global değişken kullanarak bağlantıyı önbelleğe alıyoruz.
======================================================== */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: "tarihKulubu",
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URL, opts)
      .then((mongoose) => {
        console.log("✅ DB Bağlantısı Başarılı");
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ DB Bağlantı Hatası:", e);
    throw e;
  }

  return cached.conn;
}

// ✅ DÜZELTME: Middleware artık bağlantıyı BEKLİYOR.
// Bağlantı varsa next() ile sayfayı açar.
// Bağlantı kopuksa veya hata varsa loading/hata ekranı basar.
app.use(async (req, res, next) => {
  // Statik dosyalar için DB beklemeye gerek yok (CSS, JS, Resimler hızlı yüklensin)
  if (
    req.path.startsWith("/css") ||
    req.path.startsWith("/js") ||
    req.path.startsWith("/img") ||
    req.path.startsWith("/fonts")
  ) {
    return next();
  }

  try {
    await connectToDatabase();
    next(); // Bağlantı başarılı, sayfayı göster
  } catch (error) {
    console.error("DB Middleware Hatası:", error);

    // API isteği ise JSON dön
    if (req.path.startsWith("/upload") || req.path.startsWith("/api")) {
      return res
        .status(503)
        .json({ error: "Sunucu hazırlanıyor, lütfen bekleyin." });
    }

    // Sayfa isteği ise Loading ekranını render et
    return res.status(503).render("pages/db-loading", { layout: false });
  }
});

/* ========================================================
   3. GÜVENLİK VE DİĞER AYARLAR
======================================================== */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https://ik.imagekit.io"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com",
        ],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://vercel.com"],
        scriptSrcAttr: ["'unsafe-inline'"],
        connectSrc: ["'self'", "https://vercel.com", "ws://localhost:*"],
      },
    },
    crossOriginResourcePolicy: false,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ========================================================
   AUTH (JWT)
======================================================== */
app.use(jwtAuth);

/* ========================================================
   CSRF'TEN MUAF ROUTE'LAR (API / UPLOAD / ADMIN)
======================================================== */
app.use("/upload", uploadRoutes);
app.use("/api/profile-media", profileMediaRouter);
app.use("/admin", adminRoute);

/* ========================================================
   CSRF KORUMASI (PAGE ROUTES)
======================================================== */
app.use(csrfProtection);
app.use(addCsrfToken);

/* ========================================================
   GLOBAL FLASH MESAJLAR
======================================================== */
app.use((req, res, next) => {
  res.locals.success = req.query.success || null;
  res.locals.error = req.query.error || null;
  next();
});

/* ========================================================
   PUBLIC ROUTE'LAR (GİRİŞ GEREKTİRMEZ)
======================================================== */
app.use("/", mainRoute);
app.use("/blog", blogRoute);
app.use("/yardim-destek", yardimDestekRoute); // ✅ YENİ
app.use("/legal", legalRoute);
app.use("/u", publicProfileRoute);
app.use("/sifre-unuttum", sifreUnuttumRoute);

/* ========================================================
   AUTH GEREKTİREN ROUTE'LAR
======================================================== */
app.use("/kullanici", kullaniciRoute);
app.use("/hesap", hesapRoute);
app.use("/profile", profileRoute);

/* ========================================================
   404 HANDLER
======================================================== */
app.use((req, res) => res.status(404).render("pages/404"));

/* 404 HANDLER */
app.use((req, res) => res.status(404).render("pages/404"));

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL)
  app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));

export default app;
