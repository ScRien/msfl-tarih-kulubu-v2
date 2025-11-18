// middlewares/auth.js
export default function auth(req, res, next) {
  // app.js içindeki JWT middleware, token geçerliyse req.user'ı dolduruyor.
  // Eğer req.user yoksa kullanıcı giriş yapmamış demektir.
  if (!req.user) {
    return res.redirect("/kullanici/oturumAc?error=Lütfen+giriş+yapın");
  }

  // Güvenlik için id / username / role kesin gelsin
  req.user = {
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
  };

  next();
}
