export default function auth(req, res, next) {
  if (!req.user) {
    return res.redirect("/kullanici/oturumAc?error=Lütfen+giriş+yapın");
  }
  next();
}
