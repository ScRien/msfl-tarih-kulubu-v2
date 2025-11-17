export default function auth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/kullanici/oturumAc");
  }
  next();
}
