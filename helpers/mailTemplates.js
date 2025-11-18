export function verificationMailTemplate(name, code) {
  return `
  <!DOCTYPE html>
  <html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <title>Tarih Kulübü - Doğrulama Kodunuz</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f5f6fa;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #333;
      }

      .wrapper {
        width: 100%;
        padding: 25px 0;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border: 1px solid #ececec;
      }

      /* HEADER */
      .header {
        background: #ffffff;
        padding: 25px;
        text-align: center;
        border-bottom: 1px solid #e5e5e5;
      }
      .header-logo {
        font-size: 22px;
        font-weight: 800;
        color: #222;
      }
      .header-sub {
        font-size: 13px;
        color: #555;
        margin-top: 4px;
      }

      /* MAIN CONTENT */
      .content {
        padding: 30px 30px 20px;
        color: #333;
      }

      .content h1 {
        font-size: 26px;
        font-weight: 700;
        margin-bottom: 12px;
        color: #222;
        text-align: center;
      }

      .content p {
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 14px;
        text-align: center;
      }

      /* CODE BLOCK */
      .verify-block {
        margin: 25px auto;
        background: #f0f2f5;
        border-radius: 10px;
        padding: 20px 10px;
        text-align: center;
        width: 80%;
      }

      .verify-label {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 6px;
        opacity: 0.6;
      }

      .verify-code {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 0.25em;
        color: #000;
      }

      /* BUTTON */
      .btn {
        display: block;
        width: 200px;
        margin: 22px auto 0;
        padding: 12px 0;
        background: #e52b2b;
        border-radius: 6px;
        text-align: center;
        font-size: 15px;
        font-weight: 600;
        text-decoration: none;
        color: #fff !important;
      }

      .btn:hover {
        opacity: 0.9;
      }

      /* INFO BOX */
      .gray-section {
        background: #f9fafc;
        padding: 25px;
        margin-top: 10px;
        border-top: 1px solid #e5e5e5;
      }

      .gray-section h3 {
        font-weight: 700;
        font-size: 15px;
        margin-bottom: 10px;
        color: #222;
      }

      .gray-section ul {
        padding-left: 16px;
        margin: 0;
      }

      .gray-section ul li {
        margin-bottom: 8px;
        font-size: 14px;
        color: #444;
      }

      /* FOOTER */
      .footer {
        padding: 20px 25px;
        font-size: 12px;
        color: #777;
        background: #ffffff;
        border-top: 1px solid #e5e5e5;
        text-align: center;
      }

      .footer small {
        display: block;
        margin-top: 6px;
        font-size: 11px;
        color: #aaa;
      }

      @media(max-width: 600px) {
        .container { border-radius: 0; }
        .verify-code { font-size: 26px; }
      }
    </style>
  </head>

  <body>
    <div class="wrapper">
      <div class="container">

        <!-- HEADER -->
        <div class="header">
          <div class="header-logo">Mustafa Saffet Fen Lisesi</div>
          <div class="header-sub">Tarih Kulübü • Resmî Doğrulama E-postası</div>
        </div>

        <!-- MAIN -->
        <div class="content">
          <h1>Merhaba ${name || "Sevgili Öğrencimiz"}!</h1>
          <p>
            Tarih Kulübü web sitemizde bir işlem gerçekleştirdin.<br />
            Devam edebilmen için e-posta doğrulamasına ihtiyacımız var.
          </p>

          <div class="verify-block">
            <div class="verify-label">Doğrulama Kodun</div>
            <div class="verify-code">${code}</div>
          </div>

          <a class="btn">Kodu Kullan</a>

          <p style="margin-top: 18px;">
              Kodun <b>5 dakika</b> boyunca geçerlidir. Bu işlemi sen yapmadıysan lütfen 
              öğretmenine ya da <b>msfltarihkulubu@outlook.com</b> adresine haber ver.
          </p>
        </div>

        <!-- NEXT STEPS SECTION -->
        <div class="gray-section">
          <h3>Bundan sonra ne olacak?</h3>
          <ul>
            <li>Doğrulama kodunu kullanarak işlemini tamamlayacaksın.</li>
            <li>Hesabın daha güvenli hale gelecek.</li>
            <li>Gerekirse bizi her zaman bilgilendirebilirsin.</li>
          </ul>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <strong>GHV Mustafa Saffet Fen Lisesi Tarih Kulübü</strong>
          <small>Bu e-posta otomatik gönderilmiştir, lütfen yanıtlamayınız.</small>
          <small>© ${new Date().getFullYear()} MSFL — Tüm hakları saklıdır.</small>
        </div>

      </div>
    </div>
  </body>
  </html>
  `;
}
