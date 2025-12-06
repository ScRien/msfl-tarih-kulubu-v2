import jwt from "jsonwebtoken";

export default function jwtAuth(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    req.user = null;
    res.locals.isAuth = false;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "jwt_super_secret_123"
    );

    req.user = decoded;
    res.locals.isAuth = true;
    res.locals.currentUser = decoded.username;
    res.locals.currentUserRole = decoded.role;
  } catch (err) {
    res.clearCookie("auth_token");
    req.user = null;
    res.locals.isAuth = false;
  }

  next();
}
