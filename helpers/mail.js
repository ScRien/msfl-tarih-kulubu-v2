// helpers/mail.js
import dotenv from "dotenv";
dotenv.config();

import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendMail(to, subject, html) {
  const msg = {
    to,
    from: {
      name: "MSFL Tarih Kulübü",
      email: process.env.SENDGRID_FROM,
    },
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("📩 Mail gönderildi ✔");
    return true;
  } catch (err) {
    console.error("❌ Mail gönderilemedi:", err.response?.body || err);
    return false;
  }
}

export async function sendDeletedMail(to, username) {
  await sgMail.send({
    to,
    from: "msfltarihkulubu@outlook.com",
    subject: "MSFL Tarih Kulübü | Hesabınız Silindi",
    html: deletedMailTemplate(username),
  });
}
