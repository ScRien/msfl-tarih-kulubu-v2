import moment from "moment";

export default function generateDate(date, format) {
  // format bir object geldiyse (Handlebars bug'i)
  if (typeof format === "object" || !format) {
    format = "DD.MM.YYYY"; // varsayılan
  }

  return moment(date).format(format);
}
