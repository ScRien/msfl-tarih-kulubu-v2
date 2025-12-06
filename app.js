import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import exphbs from "express-handlebars";
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

/* DB */
let serverReady = false;
await mongoose
  .connect(process.env.MONGO_URL, { dbName: "tarihKulubu" })
  .then(() => (serverReady = true))
  .catch((e) => logger.error(e));

app.use((req, res, next) => {
  if (!serverReady) return res.send("Hazırlanıyor");
  next();
});

/* CSP */
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
        connectSrc: ["'self'", "https://vercel.com"],
      },
    },
    crossOriginResourcePolicy: false,
  })
);

/* BODY */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* STATIC — CSRF ÖNCESİ */
app.use(express.static(path.join(__dirname, "public")));

/* AUTH */
app.use(jwtAuth);

/* CSRF DIŞI */
app.use("/api/profile-media", profileMediaRouter);
app.use("/upload", uploadRoutes);
app.use("/admin", adminRoute);

/* HBS */
app.engine(
  "handlebars",
  exphbs.create({
    defaultLayout: "main",
    helpers: { eq, generateDate, toString, ...handlebarsHelpers },
  }).engine
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

/* CSRF */
app.use(csrfProtection);
app.use(addCsrfToken);

app.use((req, res, next) => {
  res.locals.success = req.query.success || null;
  res.locals.error = req.query.error || null;
  next();
});

/* ROUTES */
app.use("/", mainRoute);
app.use("/blog", blogsRoute);
app.use("/kullanici", kullaniciRoute);
app.use("/legal", legalRoute);
app.use("/hesap", hesapRoute);
app.use("/profile", profileRoute);
app.use("/sifre-unuttum", sifreUnuttumRoute);
app.use("/u", publicProfileRoute);

/* 404 */
app.use((req, res) => res.status(404).render("pages/404"));

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL)
  app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));

export default app;
