// demo-mail.js
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

// .env dosyasını yükle
dotenv.config();

// SendGrid API Key ayarı
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Test maili
const msg = {
  to: process.env.TEST_RECEIVER, // Test mail alıcısı
  from: {
    name: "MSFL Tarih Kulübü",
    email: process.env.SENDGRID_FROM // doğruladığımız mail adresi
  },
  subject: "Test Mail – SendGrid ✔",
  html: `
    <h2>SendGrid Test Maili</h2>
    <p>Merhaba! Bu mail SendGrid ile gönderildi.</p>
    <p><b>Her şey yolunda!</b> 🎉</p>
  `,
};

async function sendTest() {
  try {
    await sgMail.send(msg);
    console.log("📩 Test mail başarıyla gönderildi!");
  } catch (err) {
    console.error("❌ Mail Gönderilemedi:");
    console.error(err);
  }
}

sendTest();
