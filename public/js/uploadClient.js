// public/js/uploadClient.js

// ✅ GÜVENLİ & STABİL IMAGE UPLOAD
export async function uploadImage(file, folder = "/blog") {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin", // 🔑 auth_token cookie'yi gönder
          body: JSON.stringify({
            fileBase64: reader.result,
            fileName: file.name,
            folder,
          }),
        });

        // ❗ Burada hem status hem de content-type kontrolü yapacağız
        const contentType = res.headers.get("content-type") || "";

        // JSON olmayan / başarısız response'lar için:
        if (!res.ok || !contentType.includes("application/json")) {
          const text = await res.text(); // büyük ihtimalle HTML
          console.error("UPLOAD ERROR RAW RESPONSE:", text);
          return reject(new Error("Geçersiz sunucu cevabı (JSON değil)"));
        }

        // ✅ Buraya geldiysek artık güvenle JSON parse edebiliriz
        const data = await res.json();

        if (!data?.url || !data?.fileId) {
          console.error("UPLOAD ERROR DATA:", data);
          return reject(new Error("Geçersiz upload cevabı (url/fileId yok)"));
        }

        resolve(data); // { url, fileId }
      } catch (err) {
        console.error("UPLOAD FETCH ERROR:", err);
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Dosya okunamadı"));
    reader.readAsDataURL(file);
  });
}
