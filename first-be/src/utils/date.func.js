const moment = require('moment');


const isStartDateCurrentYear = (employeeStartDate) => {
  const currentYear = moment().year();

  return moment(employeeStartDate).year() === currentYear
}

const getDateMonthNumber = (date) => {
  return moment(date).month();
}

const getMonthCountFromDateTillEndOfYear = (startDate) => {
  const endOfYear = moment().endOf('year');
  const start = moment(startDate);

  return endOfYear.diff(start, 'months');
}

const getDaysFractionOfMonth = (startDate) => {
  const daysInMonth = moment(startDate).daysInMonth();
  const dayNumber = moment(startDate).date();

  return (daysInMonth - dayNumber) / daysInMonth;
}
module.exports = {
  isStartDateCurrentYear,
  getDateMonthNumber,
  getMonthCountFromDateTillEndOfYear,
  getDaysFractionOfMonth

}
