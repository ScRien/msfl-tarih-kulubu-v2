// helpers/mailTemplates.js

export function verificationMailTemplate(name, code) {
  return `
  <!DOCTYPE html>
  <html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <title>Tarih Kulübü - Doğrulama Kodu</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f3f4f6;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .wrapper {
        width: 100%;
        padding: 20px 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        border: 1px solid #e5e7eb;
      }
      .header {
        background: linear-gradient(to right, #731919, #e52b2b);
        padding: 18px 24px;
        color: #ffffff;
        text-align: left;
      }
      .logo-title {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
      }
      .logo-sub {
        font-size: 13px;
        margin: 4px 0 0;
        opacity: 0.9;
      }
      .badge {
        display: inline-block;
        margin-top: 8px;
        padding: 3px 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.15);
        font-size: 11px;
      }
      .content {
        padding: 24px;
        color: #111827;
        font-size: 15px;
        line-height: 1.6;
      }
      .content h1 {
        font-size: 20px;
        margin: 0 0 10px;
        color: #111827;
      }
      .code-box {
        margin: 18px 0;
        padding: 14px 18px;
        border-radius: 12px;
        background: #0a0d13;
        color: #f9fafb;
        text-align: center;
      }
      .code-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        opacity: 0.8;
        margin-bottom: 6px;
      }
      .code {
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0.28em;
      }
      .info-box {
        margin-top: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        font-size: 13px;
        color: #4b5563;
      }
      .footer {
        padding: 14px 24px 18px;
        font-size: 11px;
        color: #6b7280;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }
      .footer-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: #374151;
      }
      .small {
        font-size: 11px;
        color: #9ca3af;
      }
      @media (max-width: 640px) {
        .container {
          border-radius: 0;
        }
        .content {
          padding: 18px;
        }
        .code {
          font-size: 22px;
          letter-spacing: 0.22em;
        }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">

        <div class="header">
          <p class="logo-title">GHV Mustafa Saffet Fen Lisesi</p>
          <p class="logo-sub">Tarih Kulübü • Resmî E-posta</p>
          <span class="badge">msfl tarih kulübü</span>
        </div>

        <div class="content">
          <h1>Merhaba ${name || "Sevgili Öğrencimiz"},</h1>
          <p>
            Tarih Kulübü web sitemizde şifre değiştirme işlemi başlatıldı.
            İşlemi tamamlamak için aşağıdaki doğrulama kodunu kullanmanı gerekiyor.
          </p>

          <div class="code-box">
            <div class="code-label">Doğrulama Kodun</div>
            <div class="code">${code}</div>
          </div>

          <div class="info-box">
            Bu kod <b>5 dakika</b> boyunca geçerlidir. Bu isteği sen yapmadıysan,
            lütfen şifreni değiştirme ve bir öğretmenine ya da kulüp sorumlusuna haber ver.
          </div>

          <p style="margin-top: 18px;">
            Tarihi sadece kitaplardan değil, <b>birlikte ürettiğimiz içeriklerden</b> de
            öğreniyoruz. İyi ki Tarih Kulübü ailesinin bir parçasısın. 💫
          </p>
        </div>

        <div class="footer">
          <div class="footer-title">GHV Mustafa Saffet Fen Lisesi Tarih Kulübü</div>
          <div>Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayınız.</div>
          <div class="small" style="margin-top: 4px;">
            © ${new Date().getFullYear()} MSFL Tarih Kulübü — Tüm hakları saklıdır.
          </div>
        </div>

      </div>
    </div>
  </body>
  </html>
  `;
}
