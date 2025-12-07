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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

/* DB BAĞLANTISI */
let serverReady = false;
mongoose
  .connect(process.env.MONGO_URL, { dbName: "tarihKulubu" })
  .then(() => (serverReady = true))
  .catch((e) => logger.error(e));

app.use((req, res, next) => {
  if (!serverReady) return res.send("Hazırlanıyor");
  next();
});

/* CSP - GÜVENLİK AYARLARI */
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

        // ✅ DÜZELTME 1: HTML içindeki onerror="..." kodlarının çalışması için bu satır şart:
        scriptSrcAttr: ["'unsafe-inline'"],

        connectSrc: ["'self'", "https://vercel.com", "ws://localhost:*"],
      },
    },
    crossOriginResourcePolicy: false,
  })
);

/* BODY PARSER */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* STATIC DOSYALAR */
app.use(express.static(path.join(__dirname, "public")));

/* AUTH MIDDLEWARE */
app.use(jwtAuth);

/* CSRF'TEN MUAF ROUTE'LAR */
app.use("/upload", uploadRoutes);
app.use("/api/profile-media", profileMediaRouter);
app.use("/admin", adminRoute);

/* HBS SETUP (VIEW ENGINE) */
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    helpers: { eq, generateDate, toString, ...handlebarsHelpers },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

/* CSRF KORUMASI */
app.use(csrfProtection);
app.use(addCsrfToken);

app.use((req, res, next) => {
  res.locals.success = req.query.success || null;
  res.locals.error = req.query.error || null;
  next();
});

/* NORMAL ROUTE'LAR */
app.use("/", mainRoute);
app.use("/blog", blogRoute);
app.use("/kullanici", kullaniciRoute);
app.use("/legal", legalRoute);
app.use("/hesap", hesapRoute);
app.use("/profile", profileRoute);
app.use("/sifre-unuttum", sifreUnuttumRoute);
app.use("/u", publicProfileRoute);

/* 404 HANDLER */
app.use((req, res) => res.status(404).render("pages/404"));

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL)
  app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));

export default app;
