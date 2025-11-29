// ===============================
// MODÜLLER
// ===============================
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import helmet from "helmet";

// Middlewares
import { csrfProtection, addCsrfToken } from "./middlewares/csrf.js";

// Helpers
import { eq } from "./helpers/eq.js";
import { generateDate } from "./helpers/generateDate.js";
import handlebarsHelpers from "./helpers/handlebarsHelpers.js";
import logger from "./helpers/logger.js";
import toString from "./helpers/toString.js";

// Routes
import mainRoute from "./routes/main.js";
import blogsRoute from "./routes/blogs.js";
import kullaniciRoute from "./routes/kullanici.js";
import legalRoute from "./routes/legal.js";
import hesapRoute from "./routes/hesap.js";
import profileRoute from "./routes/profile.js";
import publicProfileRoute from "./routes/publicProfile.js";
import sifreUnuttumRoute from "./routes/sifreUnuttum.js";
import adminRoute from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";
import profileMediaRouter from "./routes/profileMedia.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

// ========================================================
// DB HAZIRLIK
// ========================================================
let serverReady = false;

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: "tarihKulubu",
      serverSelectionTimeoutMS: 8000,
    });
    logger.info("✔ MongoDB bağlantısı başarılı");
    serverReady = true;
  } catch (err) {
    logger.error("❌ MongoDB bağlantı hatası", err);
  }
}

await connectDB();

// ========================================================
// DB BEKLENMEDEN REQUEST GELİRSE
// ========================================================
app.use((req, res, next) => {
  if (!serverReady) {
    return res.send("Sunucu hazırlanıyor, lütfen bekleyin...");
  }
  next();
});

// ========================================================
// GÜVENLİK
// ========================================================
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ========================================================
// BODY & COOKIE
// ========================================================
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

app.locals.isProd = process.env.NODE_ENV === "production";

// ========================================================
// JWT AUTH MIDDLEWARE (GLOBAL)
// ========================================================
const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

app.use((req, res, next) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    req.user = null;
    res.locals.isAuth = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    res.locals.isAuth = true;
    res.locals.currentUser = decoded.username;
    res.locals.currentUserRole = decoded.role;
  } catch {
    res.clearCookie("auth_token");
    req.user = null;
    res.locals.isAuth = false;
  }
  next();
});

// ========================================================
// 🔥 CSRF DIŞI API (ÖNCE)
// ========================================================
app.use("/api/upload", uploadRoutes);
app.use("/api/profile-media", profileMediaRouter);
  app.use("/admin", adminRoute);

// ========================================================
// STATIC
// ========================================================
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/img", express.static(path.join(__dirname, "public/img")));
app.use("/fonts", express.static(path.join(__dirname, "public/fonts")));

// ========================================================
// HANDLEBARS
// ========================================================
app.engine(
  "handlebars",
  exphbs.create({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    extname: ".handlebars",
    helpers: {
      eq,
      generateDate,
      toString,
      ...handlebarsHelpers,
    },
  }).engine
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// ========================================================
// ✅ CSRF (API DIŞINDA HER YERDE)
// ========================================================
app.use(csrfProtection);
app.use(addCsrfToken);

// ========================================================
// MAINTENANCE
// ========================================================
if (process.env.MAINTENANCE_MODE === "true") {
  app.use((req, res) => {
    return res.status(503).render("pages/bakim", { layout: false });
  });
} else {
  app.use("/", mainRoute);
  app.use("/blog", blogsRoute);
  app.use("/kullanici", kullaniciRoute);
  app.use("/legal", legalRoute);
  app.use("/hesap", hesapRoute);
  app.use("/profile", profileRoute);
  app.use("/sifre-unuttum", sifreUnuttumRoute);
  app.use("/u", publicProfileRoute);
}

// ========================================================
// 404
// ========================================================
app.use((req, res) => {
  res.status(404).render("pages/404");
});

// ========================================================
// SERVER
// ========================================================
const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
  });
}

export default app;
