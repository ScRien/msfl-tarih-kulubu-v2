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
        background: #f3f4f6;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .wrapper {
        width: 100%;
        padding: 26px 0;
      }

      .container {
        max-width: 620px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      }

      .header {
        padding: 28px 24px;
        text-align: center;
        background: #ffffff;
        border-bottom: 1px solid #e6e6e6;
      }

      .header-logo {
        font-size: 20px;
        font-weight: 800;
        color: #1f2937;
      }

      .header-sub {
        font-size: 13px;
        color: #6b7280;
        margin-top: 4px;
      }

      .content {
        padding: 34px 30px 20px;
        text-align: center;
        color: #374151;
      }

      .content h1 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 12px;
        color: #1f2937;
      }

      .content p {
        font-size: 15px;
        line-height: 1.65;
        margin-bottom: 16px;
      }

      .verify-block {
        margin: 28px auto 18px;
        width: 82%;
        background: #f4f5f7;
        padding: 22px 0;
        border-radius: 12px;
      }

      .verify-label {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.6;
        margin-bottom: 6px;
      }

      .verify-code {
        font-size: 34px;
        font-weight: 800;
        letter-spacing: 0.22em;
        color: #111827;
      }

      .gray-section {
        background: #fafafa;
        padding: 26px;
        border-top: 1px solid #ececec;
        text-align: left;
      }

      .gray-section h3 {
        font-size: 15px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 12px;
      }

      .gray-section ul {
        padding-left: 16px;
        margin: 0;
      }

      .gray-section ul li {
        font-size: 14px;
        margin-bottom: 8px;
        color: #4b5563;
      }

      .footer {
        text-align: center;
        font-size: 12px;
        padding: 20px 25px;
        color: #6b7280;
        background: #ffffff;
        border-top: 1px solid #e5e7eb;
      }

      @media(max-width: 600px) {
        .container { border-radius: 0; }
        .verify-code { font-size: 28px; }
      }
    </style>
  </head>

  <body>
    <div class="wrapper">
      <div class="container">

        <div class="header">
          <div class="header-logo">Mustafa Saffet Fen Lisesi</div>
          <div class="header-sub">Tarih Kulübü • E-posta Doğrulama Kodu</div>
        </div>

        <div class="content">
          <h1>Merhaba ${name || "Sevgili Öğrencimiz"}!</h1>
          <p>
            Tarih Kulübü web sisteminde bir işlem gerçekleştirdin.<br />
            Devam edebilmen için aşağıdaki doğrulama kodunu kullanmalısın.
          </p>

          <div class="verify-block">
            <div class="verify-label">Doğrulama Kodun</div>
            <div class="verify-code">${code}</div>
          </div>

          <p style="margin-top: 12px;">
            Kodun <b>5 dakika</b> boyunca geçerlidir.<br>
            Eğer bu işlem sana ait değilse lütfen
            <b>msfltarihkulubu@outlook.com</b> adresine haber ver.
          </p>
        </div>

        <div class="gray-section">
          <h3>Bundan sonra ne olacak?</h3>
          <ul>
            <li>Kodu ilgili alana girerek işlemini tamamlayacaksın.</li>
            <li>Hesabın daha güvenli hale gelecek.</li>
            <li>Gerekirse bizimle iletişime geçebilirsin.</li>
          </ul>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} MSFL Tarih Kulübü • Otomatik e-postadır, yanıtlama.
        </div>

      </div>
    </div>
  </body>
  </html>
  `;
}

export function accountDeletedMailTemplate(username) {
  return `
  <!DOCTYPE html>
  <html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <title>MSFL Tarih Kulübü - Hesap Silindi</title>

    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f2f3f7;
        font-family: 'Segoe UI', Arial, sans-serif;
      }
      .container {
        max-width: 620px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      }
      h1 {
        color: #d62828;
        text-align: center;
        margin-bottom: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      p {
        font-size: 15px;
        line-height: 1.65;
        color: #333;
        margin: 14px 0;
      }
      strong {
        color: #000;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        text-align: center;
        color: #777;
        border-top: 1px solid #eee;
        padding-top: 15px;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <h1>Hesabınız Silindi</h1>

      <p>Merhaba <strong>@${username}</strong>,</p>

      <p>
        MSFL Tarih Kulübü web sistemindeki hesabınız isteğiniz üzerine başarıyla silindi.
        Bu işlem <strong>kalıcıdır</strong> ve geri alınamaz.
      </p>

      <p>
        Eğer bu işlemi siz gerçekleştirmediyseniz veya destek talep etmek isterseniz,
        kullanıcı adınızı ve mail adresinizi belirterek şu adrese e-posta gönderebilirsiniz:
        <br><br>
        <strong>msfltarihkulubu@outlook.com</strong>
      </p>

      <div class="footer">
        © ${new Date().getFullYear()} MSFL Tarih Kulübü<br>
        Bu e-posta otomatik gönderilmiştir, lütfen yanıtlamayınız.
      </div>
    </div>
  </body>
  </html>
  `;
}
