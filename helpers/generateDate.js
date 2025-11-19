import moment from "moment";

export const generateDate = (date, format = "DD.MM.YYYY HH:mm") => {
  try {
    return moment(date).format(format);
  } catch (err) {
    return ""; // en azından sayfa patlamaz
  }
};
