export default function sanitizeBody(req, res, next) {
  if (req.body) {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        // $ ve . karakterlerini temizle
        req.body[key] = req.body[key].replace(/\$/g, "").replace(/\./g, "");
      }
    }
  }
  next();
}
