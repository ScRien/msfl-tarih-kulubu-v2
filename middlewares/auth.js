import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.redirect("/kullanici/oturumAc?error=Lütfen+giriş+yapın");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "jwt_super_secret_123"
    );

    // Oturum kullanıcı bilgisi
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (err) {
    // Token bozuksa temizle
    res.clearCookie("auth_token", {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.redirect("/kullanici/oturumAc?error=Oturum+geçersiz");
  }
}
