// middlewares/auth.js

export default function auth(req, res, next) {
  if (!req.user) {
    return res.redirect("/kullanici/oturumAc?error=Oturum+açmanız+gerekiyor");
  }
  next();
}
