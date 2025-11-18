import csrf from "csurf";

// CSRF koruması
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
});

// CSRF token'ı tüm view'lara ekle
export const addCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};