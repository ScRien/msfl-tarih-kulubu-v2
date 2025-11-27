import fs from "fs";
import fetch from "node-fetch";

async function runTest() {
  try {
    // ✅ Test edilecek görsel
    const imagePath = "./public/img/default-blog.jpg";
    const fileBuffer = fs.readFileSync(imagePath);

    // Base64'e çevir
    const base64 = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;

    const res = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // auth middleware varsa cookie eklemen gerekebilir:
        // "Cookie": "auth_token=XXX"
      },
      body: JSON.stringify({
        fileBase64: base64,
        fileName: "default-blog.jpg",
        folder: "/test-uploads",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Upload failed:", data);
      return;
    }

    console.log("✅ UPLOAD BAŞARILI");
    console.log("URL:", data.url);
    console.log("fileId:", data.fileId);

  } catch (err) {
    console.error("❌ TEST ERROR:", err);
  }
}

runTest();
