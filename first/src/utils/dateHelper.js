import moment from 'moment/moment';

function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export const DateHelper = {

getStartOfMonth: () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  },

  getToday: () => {
    return new Date();
  },

  getTomorrow: () => {
    const today = DateHelper.getToday();
    return DateHelper.increaseDay(today, 1);
  },

  getEndOfMonth: (startOfMonth) => {
    const endOfMonth = new Date(startOfMonth);
    const nextMonth = startOfMonth.getMonth() + 1;
    endOfMonth.setMonth(nextMonth);
    endOfMonth.setDate(0);
    return endOfMonth;
  },


  getStartOfWeek: () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return startOfWeek;
  },

  increaseDay: (date, count = 1) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + count);
    return newDate;
  },

  decreaseWeek: (startDate, endDate) => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() - 7);
    const newEndDate = new Date(endDate);
    newEndDate.setDate(newEndDate.getDate() - 7);
    return [newStartDate, newEndDate];
  },

  increaseWeek: (startDate, endDate) => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() + 7);
    const newEndDate = new Date(endDate);
    newEndDate.setDate(newEndDate.getDate() + 7);
    return [newStartDate, newEndDate];
  },

  decreaseMonth: (startDate, endDate) => {
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    newStartDate.setDate(1);
    newStartDate.setMonth(newStartDate.getMonth() - 1);

    if (startDate.getDate() === getLastDayOfMonth(startDate.getFullYear(), startDate.getMonth())) {
      newEndDate.setDate(Math.min(endDate.getDate(), getLastDayOfMonth(newStartDate.getFullYear(), newStartDate.getMonth())));
    } else {
      newEndDate.setDate(1);
      newEndDate.setMonth(newEndDate.getMonth() - 1);
      const lastDayOfEndMonth = getLastDayOfMonth(newEndDate.getFullYear(), newEndDate.getMonth());
      newEndDate.setDate(lastDayOfEndMonth);
    }

    return [newStartDate, newEndDate];
  },

  increaseMonth: (startDate, endDate) => {
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    newStartDate.setDate(1);
    newStartDate.setMonth(newStartDate.getMonth() + 1);

    if (startDate.getDate() === getLastDayOfMonth(startDate.getFullYear(), startDate.getMonth())) {
      newEndDate.setDate(Math.min(endDate.getDate(), getLastDayOfMonth(newEndDate.getFullYear(), newEndDate.getMonth())));
    } else {
      newEndDate.setDate(1);
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      const lastDayOfEndMonth = getLastDayOfMonth(newEndDate.getFullYear(), newEndDate.getMonth());
      newEndDate.setDate(lastDayOfEndMonth);
    }

    return [newStartDate, newEndDate];
  },

  decreaseYear: (startDate, endDate) => {
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
    newStartDate.setFullYear(newStartDate.getFullYear() - 1);
    newEndDate.setFullYear(newEndDate.getFullYear() - 1);
    return [newStartDate, newEndDate];
  },

  increaseYear: (startDate, endDate) => {
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
    newStartDate.setFullYear(newStartDate.getFullYear() + 1);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    return [newStartDate, newEndDate];
  },

  calculateRangeOfUsedDays: (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);

    const daysArray = [];
    for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
      daysArray.push(m.clone());
    }

    const holidaysDaysArray = daysArray.filter(day => day.day() !== 0 && day.day() !== 6);

    return holidaysDaysArray.length;
  }
};
