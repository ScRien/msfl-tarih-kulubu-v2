import multer from "multer";

// Vercel uyumlu — disk yok, RAM kullanılır
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export default upload;
