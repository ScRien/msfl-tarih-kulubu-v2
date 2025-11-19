import moment from "moment";
import Handlebars from "handlebars";

// ====== TARİH FORMATLAMA ======
Handlebars.registerHelper(
  "generateDate",
  (date, format = "DD.MM.YYYY HH:mm") => {
    try {
      return moment(date).format(format);
    } catch (err) {
      return "";
    }
  }
);

// ====== METİN KISALTMA (BLOG ÖZETİ) ======
Handlebars.registerHelper("truncate", (text, size) => {
  if (!text) return "";
  text = text.toString();
  return text.length > size ? text.substring(0, size) + "..." : text;
});

// ====== PAGINATION ======
Handlebars.registerHelper("increment", (value) => value + 1);
Handlebars.registerHelper("decrement", (value) => value - 1);
Handlebars.registerHelper("gt", (a, b) => a > b);
Handlebars.registerHelper("lt", (a, b) => a < b);

// ====== EŞİTLİK KONTROLÜ ======
Handlebars.registerHelper("eq", (a, b) => a == b);

// ====== NOT-EMPTY ======
Handlebars.registerHelper("notEmpty", (v) => {
  return v && v.length > 0;
});

// ====== UPPERCASE ======
Handlebars.registerHelper("upper", (str) => {
  return str ? str.toString().toUpperCase() : "";
});

// ====== LOWERCASE ======
Handlebars.registerHelper("lower", (str) => {
  return str ? str.toLowerCase() : "";
});

// ====== SAFE STRING ======
Handlebars.registerHelper("safe", (html) => {
  return new Handlebars.SafeString(html);
});

// ====== PARAGRAF FORMATLAYICI (BLOG İÇERİĞİ) ======
Handlebars.registerHelper("formatParagraphs", (content) => {
  if (!content) return "";

  // toString kullanmıyoruz → güvenlik hatası çıkmasın
  const cleaned = String(content).trim();

  const paragraphs = cleaned
    .split(/\r?\n\r?\n/)
    .map((p) => `<p>${p.trim()}</p>`)
    .join("");

  return new Handlebars.SafeString(paragraphs);
});

Handlebars.registerHelper("length", (value) => {
  if (!value) return 0;

  // Dizi veya string ise length döndür
  if (Array.isArray(value) || typeof value === "string") {
    return value.length;
  }

  // Object ise key sayısı döndür
  if (typeof value === "object") {
    return Object.keys(value).length;
  }

  return 0;
});

export default Handlebars;
