export default function auth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect("/kullanici/oturumAc?error=Lütfen+giriş+yapın");
  }

  // Oturumdan user nesnesi oluştur
  req.user = {
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role,
  };

  next();
}
