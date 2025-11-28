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
import "dotenv/config";
import helmet from "helmet";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

// ========================================================
// 1) SUNUCU HAZIR MI? (DB BAĞLANANA KADAR LOADING)
// ========================================================
let serverReady = false;

function loadingScreen(req, res) {
  return res.send(`<!DOCTYPE html>
  <html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <title>Sunucu hazırlanıyor...</title>
    <style>
      * { box-sizing:border-box; margin:0; padding:0; }
      body {
        background:#111;
        color:#fff;
        height:100vh;
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        font-family:Arial, sans-serif;
        text-align:center;
      }
      .loader {
        width:60px;
        height:60px;
        border:7px solid #444;
        border-top-color:#e52b2b;
        border-radius:50%;
        animation:spin 0.75s linear infinite;
        margin-bottom:18px;
      }
      h2 { font-size:22px; margin-bottom:6px; }
      p  { font-size:14px; color:#ccc; }
      @keyframes spin { to { transform:rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="loader"></div>
    <h2>Sunucu hazırlanıyor...</h2>
    <p>Lütfen bekleyiniz.</p>
  </body>
  </html>`);
}

// ========================================================
// 2) MONGODB BAĞLANTISI (TOP-LEVEL AWAIT)
// ========================================================
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: "tarihKulubu",
      serverSelectionTimeoutMS: 8000,
    });

    logger.info("✔ MongoDB bağlantısı başarılı");
    serverReady = true;
  } catch (err) {
    logger.error("❌ MongoDB bağlantı hatası:", err);
    // Bağlantı yoksa serverReady = false kalır ve loading ekranı döner
  }
}

await connectDB();

// ========================================================
// 3) DB HAZIR DEĞİLSE TÜM İSTEKLERDE LOADING DÖN
//    (routes / middleware'lerden ÖNCE OLMALI)
// ========================================================
app.use((req, res, next) => {
  if (!serverReady) return loadingScreen(req, res);
  next();
});

// ========================================================
// 4) EXPRESS ALTYAPISI
// ========================================================

// GÜVENLİK
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// BODY & COOKIE
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(express.json({ limit: "20mb" }));

app.use(cookieParser());
app.locals.isProd = process.env.NODE_ENV === "production";

// JWT AUTH
const JWT_SECRET = process.env.JWT_SECRET || "jwt_super_secret_123";

app.use((req, res, next) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    req.user = null;
    res.locals.isAuth = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

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

app.use("/api/upload", uploadRoutes);

// STATIC
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "public/img")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/fonts", express.static(path.join(__dirname, "public/fonts")));

// HANDLEBARS
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

// CSRF
app.use(csrfProtection);
app.use(addCsrfToken);

// ROUTES
//app.use("/", mainRoute);
//app.use("/blog", blogsRoute);
//app.use("/kullanici", kullaniciRoute);
//app.use("/legal", legalRoute);
//app.use("/hesap", hesapRoute);
//app.use("/profile", profileRoute);
//app.use("/sifre-unuttum", sifreUnuttumRoute);
//app.use("/admin", adminRoute);
//app.use("/u", publicProfileRoute);

const router = express.Router();
router.get("/", (req, res) =>
  res.render("pages/bakim", { layout: false })
);

// 404
app.use((req, res) => {
  res.status(404).render("pages/404");
});

// LOCAL GELİŞTİRME İÇİN (Vercel dışı)
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
  });
}

// EXPORT (Vercel)
export default app;
