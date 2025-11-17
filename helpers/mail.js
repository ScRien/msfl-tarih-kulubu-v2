// helpers/mail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.OUTLOOK_USER,   // Örn: msfltarihkulubu@outlook.com
    pass: process.env.OUTLOOK_PASS,   // .env'de saklanacak
  },
  tls: {
    ciphers: "SSLv3",
  },
});

/**
 * Genel mail gönderme fonksiyonu
 * @param {string|string[]} to 
 * @param {string} subject 
 * @param {string} html 
 */
export async function sendMail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"MSFL Tarih Kulübü" <${process.env.OUTLOOK_USER}>`,
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
