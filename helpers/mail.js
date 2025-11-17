// helpers/mail.js
import nodemailer from "nodemailer";

// === SMTP BAĞLANTISI ===
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  port: process.env.SMTP_PORT, // 587
  secure: process.env.SMTP_SECURE === "true", // false
  auth: {
    user: process.env.SMTP_USER, // Gmail adresi
    pass: process.env.SMTP_PASS, // Gmail uygulama şifresi
  },
});

// === GENEL MAİL GÖNDERME FONKSİYONU ===
export async function sendMail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"MSFL Tarih Kulübü" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📩 Mail gönderildi:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Mail gönderilemedi:", err);
    return false;
  }
}
