import "dotenv/config";
import sgMail from "@sendgrid/mail";

function supportResolvedMailTemplate(name, subject, messageDate) {
  return `
  <!DOCTYPE html>
  <html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <title>MSFL Tarih Kulübü - Destek Talebiniz Hakkında</title>
    <style>
      body { margin:0; padding:0; background:#f3f4f6; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
      .wrapper { width:100%; padding:26px 0; }
      .container { max-width:620px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb; box-shadow:0 4px 16px rgba(0,0,0,0.06); }
      .header { padding:28px 24px; text-align:center; border-bottom:1px solid #e6e6e6; }
      .header-logo { font-size:20px; font-weight:800; color:#1f2937; }
      .header-sub { font-size:13px; color:#6b7280; margin-top:4px; }
      .content { padding:34px 30px 20px; text-align:center; color:#374151; }
      .content h1 { font-size:23px; font-weight:700; margin-bottom:14px; color:#1f2937; }
      .content p { font-size:15px; line-height:1.65; margin-bottom:16px; }
      .success-box { margin:26px auto; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:18px 20px; border-radius:12px; font-size:14px; }
      .gray-section { background:#fafafa; padding:26px; border-top:1px solid #ececec; text-align:left; }
      .gray-section h3 { font-size:15px; font-weight:700; color:#1f2937; margin-bottom:12px; }
      .gray-section ul { padding-left:16px; margin:0; }
      .gray-section ul li { font-size:14px; margin-bottom:8px; color:#4b5563; }
      .footer { text-align:center; font-size:12px; padding:20px 25px; color:#6b7280; background:#fff; border-top:1px solid #e5e7eb; }
      @media(max-width:600px){ .container{ border-radius:0; } }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <div class="header-logo">Mustafa Saffet Fen Lisesi</div>
          <div class="header-sub">Tarih Kulübü • Destek Ekibi</div>
        </div>

        <div class="content">
          <h1>Merhaba ${name || "Sevgili Kullanıcımız"} 👋</h1>

          <p>
            <strong>${subject}</strong> konulu destek talebinizi aldık ve
            sistemimiz üzerinde gerekli kontrolleri gerçekleştirdik.
          </p>

          <div class="success-box">
            ✅ Yaşadığınız sorun tespit edildi ve sistemimiz güncellendi.<br />
            Artık ilgili işlemi sorunsuz bir şekilde gerçekleştirebilirsiniz.
          </div>

          <p>
            Talebiniz <strong>${messageDate}</strong> tarihinde tarafımıza ulaşmıştır.
            Geri bildiriminiz, sistemimizi geliştirmemiz açısından bizim için çok değerlidir.
          </p>

          <p style="margin-top:10px;">
            Herhangi bir sorun yaşamanız durumunda bizimle tekrar iletişime geçmekten çekinmeyin.
          </p>
        </div>

        <div class="gray-section">
          <h3>Bundan sonra ne yapabilirsiniz?</h3>
          <ul>
            <li>Hesabınızdan ilgili işlemi tekrar deneyebilirsiniz.</li>
            <li>Profil ve ayar sayfalarınızı kontrol edebilirsiniz.</li>
            <li>Gerekirse yeni bir destek talebi oluşturabilirsiniz.</li>
          </ul>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} MSFL Tarih Kulübü • Bu e-posta otomatik gönderilmiştir.
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

// 1) API KEY yükle
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY yok (.env okunmuyor)");
  process.exit(1);
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 2) Gönderim ayarları
const TO = "yakuteyupkaan@gmail.com";

// ⚠️ SendGrid'de doğrulanmış sender kullanman lazım.
// Eğer verified sender msfltarihkulubu@outlook.com değilse burada patlar.
const FROM = "MSFL Tarih Kulübü <msfltarihkulubu@outlook.com>";

const html = supportResolvedMailTemplate(
  "Eyüp Kaan",
  "Teknik Hata",
  "13/12/2025 08:53"
);

// 3) Gönder
try {
  await sgMail.send({
    to: TO,
    from: FROM,
    subject: "Destek Talebiniz Çözümlendi",
    html,
  });
  console.log("✅ Mail gönderildi");
} catch (err) {
  console.error(
    "❌ Mail gönderilemedi:",
    err.response?.body || err.message || err
  );
}
