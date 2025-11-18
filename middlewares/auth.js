// middlewares/auth.js
export default function auth(req, res, next) {
  // app.js içindeki JWT middleware req.user'ı set ediyor
  if (!req.user) {
    return res.redirect("/kullanici/oturumAc?error=Lütfen+giriş+yapın");
  }

  next();
}
