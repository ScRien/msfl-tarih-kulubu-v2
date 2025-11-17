import moment from "moment";
import "moment/locale/tr.js";

moment.locale("tr");

export const generateDate = (date, format) => {
  return moment(date).format(format);
};
