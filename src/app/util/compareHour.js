import {
  getDate,
  getMonth,
  getYear,
  parseISO,
  format,
  addHours,
  isAfter,
} from 'date-fns';

class CompareHour {
  run() {
    const newDate = new Date();

    const date = format(newDate, "yyyy-MM-dd'T'HH:mm:ssxxx");
    const parsedDate = parseISO(date);
    const dateToCompare = addHours(parsedDate, 3);

    //hora de inicio 8horas //add 3 hours
    const compDateStart = addHours(
      new Date(getYear(newDate), getMonth(newDate), getDate(newDate), 8, 0, 0),
      3
    );

    //hora do fim as 18horas
    const compDateEnd = addHours(
      new Date(getYear(newDate), getMonth(newDate), getDate(newDate), 21, 0, 0),
      3
    );

    const horaStart = isAfter(new Date(dateToCompare), new Date(compDateStart));
    const horaEnd = isAfter(new Date(compDateEnd), new Date(dateToCompare));

    let withdrawProduct = false;

    if (horaStart === true && horaEnd === true) {
      withdrawProduct = true;
    }

    return withdrawProduct;
  }
}
export default new CompareHour();
