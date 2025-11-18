import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import exphbs from "express-handlebars";
import "dotenv/config";

// Helpers
import { eq } from "./helpers/eq.js";
import { generateDate } from "./helpers/generateDate.js";
import handlebarsHelpers from "./helpers/handlebarsHelpers.js";

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
// VERCEL PATH FIX
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===============================
// MONGODB BAĞLANTISI
// ===============================
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "tarihKulubu",
  })
  .then(() => console.log("MongoDB bağlantısı başarılı."))
  .catch((err) => console.log("MongoDB bağlantı hatası:", err));

// ===============================
// SESSION
// ===============================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretvalue123",
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      dbName: "tarihKulubu",
      collectionName: "sessions",
      ttl: 60 * 60 * 24,
      autoRemove: "native",
    }),
  })
);

app.use(cookieParser());

// ===============================
// AUTH DURUMUNU HANDLEBARS’A AKTARAN MIDDLEWARE
// ===============================
app.use((req, res, next) => {
  res.locals.isAuth = !!req.session.userId;
  res.locals.currentUser = req.session.username || null;
  next();
});

// ===============================
// BODY-PARSER
// ===============================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ===============================
// PUBLIC KLASÖRÜ
// ===============================
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "public/img")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/fonts", express.static(path.join(__dirname, "public/fonts")));

// ===============================
// HANDLEBARS AYARLARI
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
// LOCAL
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});

// ===============================
// VERCEL EXPORT
// ===============================
export default app;
