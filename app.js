import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { apiLimiter } from "./middlewares/rateLimiter.js";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { csrfProtection, addCsrfToken } from "./middlewares/csrf.js";

// Helpers
import { eq } from "./helpers/eq.js";
import { generateDate } from "./helpers/generateDate.js";
import handlebarsHelpers from "./helpers/handlebarsHelpers.js";
import logger from "./helpers/logger.js";

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

// ===============================
// PATH FIX
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===============================
// MONGODB
// ===============================
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "tarihKulubu",
  })
  .then(() => {
    logger.info("✅ MongoDB bağlantısı başarılı");
    console.log("MongoDB bağlantısı başarılı.");
  })
  .catch((err) => {
    logger.error("❌ MongoDB bağlantı hatası:", err);
    console.log("MongoDB bağlantı hatası:", err);
  });

// ===============================
// GÜVENLİK MIDDLEWARE'LERİ
// ===============================

// Helmet - HTTP header güvenliği
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "'unsafe-inline'", // Handlebars inline scriptler için gerekli
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          "https://res.cloudinary.com",
          "data:",
          "https://*.cloudinary.com",
        ],
        connectSrc: ["'self'", "https://api.cloudinary.com"],
        fontSrc: ["'self'", "data:"],
      },
    },
  })
);

// MongoDB Injection Koruması
app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️ MongoDB injection denemesi tespit edildi: ${key}`);
    },
  })
);

// Genel Rate Limiting
app.use(apiLimiter);

// ===============================
// BODY & COOKIE PARSER
// ===============================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ===============================
// JWT TABANLI AUTH DURUMU
// ===============================
const JWT_SECRET = process.env.JWT_SECRET || "jwt_super_secret_123";

app.use((req, res, next) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    req.user = null;
    res.locals.isAuth = false;
    res.locals.currentUser = null;
    res.locals.currentUserRole = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded: { id, username, role, iat, exp }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    res.locals.isAuth = true;
    res.locals.currentUser = decoded.username;
    res.locals.currentUserRole = decoded.role;
  } catch (err) {
    // Token bozuk / süresi dolmuşsa cookie'yi temizle
    res.clearCookie("auth_token", {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    req.user = null;
    res.locals.isAuth = false;
    res.locals.currentUser = null;
    res.locals.currentUserRole = null;
  }

  next();
});

// ===============================
// PUBLIC KLASÖRÜ
// ===============================
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "public/img")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/fonts", express.static(path.join(__dirname, "public/fonts")));

// ===============================
// HANDLEBARS
// ===============================
const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  extname: ".handlebars",
  helpers: {
    eq,
    generateDate,
    ...handlebarsHelpers,
  },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// ===============================
// CSRF KORUMASI (Routes'tan önce)
// ===============================
app.use(csrfProtection);
app.use(addCsrfToken);

// ===============================
// ROUTES
// ===============================
app.use("/", mainRoute);
app.use("/blog", blogsRoute);
app.use("/kullanici", kullaniciRoute);
app.use("/legal", legalRoute);
app.use("/hesap", hesapRoute);
app.use("/profile", profileRoute);
app.use("/", publicProfileRoute);
app.use("/sifre-unuttum", sifreUnuttumRoute);
app.use("/admin", adminRoute);

// ===============================
// 404
// ===============================
app.use((req, res) => {
  res.status(404).render("pages/404");
});

// ===============================
// LOCAL (geliştirme için)
// ===============================
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  });
}

// ===============================
// VERCEL EXPORT
// ===============================
export default app;
