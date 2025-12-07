import moment from "moment";
import Handlebars from "handlebars"; // SafeString için gerekli

export default {
  // --- TARİH FORMATLAMA ---
  generateDate: (date, format = "DD.MM.YYYY HH:mm") => {
    try {
      if (!date) return "-";
      return moment(date).format(format);
    } catch (err) {
      return "";
    }
  },

  // Senin istediğin özel format (Admin paneli için)
  generateDateTime: (date) => {
    if (!date) return "-";
    try {
      return moment(date).format("DD/MM/YYYY HH:mm");
    } catch (e) {
      return "-";
    }
  },

  // --- EŞİTLİK VE MANTIKSAL OPERATÖRLER ---
  eq: (a, b) => a == b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,

  // --- MATEMATİKSEL İŞLEMLER (Pagination vb. için) ---
  increment: (value) => parseInt(value) + 1,
  decrement: (value) => parseInt(value) - 1,

  // --- METİN İŞLEMLERİ ---
  truncate: (text, size) => {
    if (!text) return "";
    text = text.toString();
    return text.length > size ? text.substring(0, size) + "..." : text;
  },

  upper: (str) => (str ? str.toString().toUpperCase() : ""),
  lower: (str) => (str ? str.toString().toLowerCase() : ""),

  // --- HTML İÇERİK (Güvenli şekilde HTML basmak için) ---
  safe: (html) => {
    return new Handlebars.SafeString(html);
  },

  formatParagraphs: (content) => {
    if (!content) return "";
    const cleaned = String(content).trim();
    const paragraphs = cleaned
      .split(/\r?\n\r?\n/)
      .map((p) => `<p>${p.trim()}</p>`)
      .join("");
    return new Handlebars.SafeString(paragraphs);
  },

  // --- DİĞER ---
  notEmpty: (v) => v && v.length > 0,

  length: (value) => {
    if (!value) return 0;
    if (Array.isArray(value) || typeof value === "string") return value.length;
    if (typeof value === "object") return Object.keys(value).length;
    return 0;
  },

  // --- PROFİL RESMİ HELPERLARI (Hesap sayfasında kullanılıyor) ---
  getAvatar: (user) => {
    if (user && user.avatar && user.avatar.url) return user.avatar.url;
    return "/img/default-avatar.png";
  },

  getCover: (user) => {
    // Veritabanında bazen cover, bazen coverImage olabilir, ikisine de bakalım
    if (user && user.coverImage && user.coverImage.url)
      return user.coverImage.url;
    if (user && user.cover && user.cover.url) return user.cover.url;
    return "/img/default-cover.png";
  },
};
