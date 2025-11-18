// Kullanıcı inputlarını temizleme
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  // XSS koruması için HTML karakterlerini encode et
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Object içindeki tüm stringleri temizle
export function sanitizeObject(obj) {
  if (typeof obj !== "object" || obj === null) return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "string") {
        sanitized[key] = sanitizeInput(obj[key]);
      } else if (typeof obj[key] === "object") {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }

  return sanitized;
}