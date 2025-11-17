import moment from "moment";
import Handlebars from "handlebars";

// ====== TARİH FORMATLAMA ======
Handlebars.registerHelper("generateDate", (date, format) => {
  return moment(date).format(format);
});

// ====== METİN KISALTMA (BLOG ÖZETİ) ======
Handlebars.registerHelper("truncate", (text, size) => {
  if (!text) return "";
  text = text.toString();
  return text.length > size ? text.substring(0, size) + "..." : text;
});

// ====== PAGINATION ====
Handlebars.registerHelper("increment", (value) => value + 1);
Handlebars.registerHelper("decrement", (value) => value - 1);
Handlebars.registerHelper("gt", (a, b) => a > b);
Handlebars.registerHelper("lt", (a, b) => a < b);

// ====== EŞİTLİK KONTROLÜ ======
Handlebars.registerHelper("eq", (a, b) => a == b);

// ====== KOŞUL İÇİN NOT-EMPTY ======
Handlebars.registerHelper("notEmpty", (v) => {
  return v && v.length > 0;
});

// ====== UPPERCASE (İsteyebilirsin diye ekledim) ======
Handlebars.registerHelper("upper", (str) => {
  return str ? str.toString().toUpperCase() : "";
});

// ====== LOWERCASE (İhtiyaç çıkarsa hazır dursun) ======
Handlebars.registerHelper("lower", (str) => {
  return str ? str.toLowerCase() : "";
});

// ====== SAFE STRING (HTML basmak için) ======
Handlebars.registerHelper("safe", (html) => {
  return new Handlebars.SafeString(html);
});

export default Handlebars;
