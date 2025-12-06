import csrf from "csurf";

const csrfMiddleware = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});

export const csrfProtection = (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  if (req.path.startsWith("/upload")) return next();
  return csrfMiddleware(req, res, next);
};

export const addCsrfToken = (req, res, next) => {
  if (req.csrfToken) res.locals.csrfToken = req.csrfToken();
  next();
};
