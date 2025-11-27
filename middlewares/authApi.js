export default function authApi(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "AUTH_REQUIRED",
      message: "Giriş yapılmamış",
    });
  }
  next();
}
