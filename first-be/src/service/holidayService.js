const moment = require('moment/moment')
const {default: axios} = require('axios')
const {Talent, Customer, Agencies} = require('../models');
const {Op} = require('sequelize');
const {Sequelize} = require('../models');


const {countryNames: countries, countryCodes} = require('../constants/countries');

const { getHolidaysForCountryCode } = require('./holidaysDataStore')
const { isWeekend } = require('../utils/util')


const getHolidaysForCountry = async (countryCode, isUkraine, year = moment().year(), filterWeekend = false) => {
    if (!countryCode) {
        throw new Error('Location must be provided!')
    }
    const holidaysResponse = await getHolidaysForCountryCode(countryCode, isUkraine, year);

    return holidaysResponse.reduce( (acc, nextHl) => {
       if (filterWeekend && isWeekend(nextHl.date.iso)) {
           return acc;
       } else {
           acc[nextHl.date.iso] = {
               name: nextHl.name,
               primary_type: nextHl.primary_type
           }
       }
        return acc;
    }, {});

};

const isISODayAsHoliday = (ISODay, holidays) => {
    return !!holidays[ISODay]
}
const filterNonHolidayDaysFromArrayOfISODays = (ISODaysArray, holidaysDaya) => {
    const holidayDates = Object.keys(holidaysDaya);

    return ISODaysArray.filter(date => !holidayDates.includes(date));
}

const getUpcomingHolidaysForTalent = async (location) => {
    const isUkraine = location === 'ua';

    const holidays = await getHolidaysForCountryCode(location, isUkraine)

    return filterHolidays(holidays);
}

const getUpcomingHolidaysForAdmin = async () => {
    const [ukraineCode, ...countryCodesList] = countryCodes;
    const results = [];

    for (const code of countryCodesList) {
        const holidays =  await getHolidaysForCountryCode(code);
        results.push(...holidays);
    }

    const ukrHolidays = await getHolidaysForCountryCode(ukraineCode, true);

    results.push(...ukrHolidays);

    return filterHolidays(results);
}


const getUpcomingHolidays = async (user) => {
    let holidays = [];
    if (user.type === 'admin') {
        holidays = await getUpcomingHolidaysForAdmin();
    } else {
        const { location } = user;
        holidays = await getUpcomingHolidaysForTalent(location);
    }

    return holidays;
};

const getHolidaysForNotification = async (location, isUkraine, year) => {
    const today = moment();
    const talents  = await getUpcomingBirthdaysIn3Days();
    const endDayForSearch = today.clone().add(3, 'days').format('DD');

    return {
        talents: talents,
        monthName: today.format('MMMM'),
        dayNumber: endDayForSearch
    }
};

const getHolidaysForOnyDayNotification = async () => {
    const today = moment();
    const talents  = await getUpcomingBirthdaysIn1Days();
    const endDayForSearch = today.clone().add(1, 'days').format('DD');

    return {
        talents: talents,
        monthName: today.format('MMMM'),
        dayNumber: endDayForSearch
    }
};

const getHolidaysForCustomers = async (location, isUkraine, year) => {
    const today = moment();
    const customers  = await getUpcomingBirthdaysCustomersIn1Days();
    const endDayForSearch = today.clone().add(1, 'days').format('DD');

    return {
        customers: customers,
        monthName: today.format('MMMM'),
        dayNumber: endDayForSearch
    }
};



const getUpcomingBirthdaysIn3Days = async () => {
    const today = moment().utc(); // Current date at UTC

    const daysToCheck = [];
    for (let i = 0; i <= 2; i++) {
        const dayToAdd = today.clone().add(i, 'days');
        daysToCheck.push({
            month: dayToAdd.month() + 1, // Moment.js months are 0-based
            day: dayToAdd.date() // Exact day of the month
        });
    }

    return await Talent.findAll({
        where: {
            [Op.or]: daysToCheck.map(date => ({
                [Op.and]: [
                    Sequelize.where(
                      Sequelize.fn('MONTH', Sequelize.col('birthday')),
                      date.month
                    ),
                    Sequelize.where(
                      Sequelize.fn('DAY', Sequelize.col('birthday')),
                      date.day
                    )
                ]
            }))
        },
        include: [
            {
                model: Agencies,
                as: 'agency',
                where: {
                    name: { [Op.in]: ['Commit Offshore', 'ITSoft'] }
                },
                required: true
            }
        ],
        order: [
            [Sequelize.fn('MONTH', Sequelize.col('birthday')), 'ASC'],
            [Sequelize.fn('DAY', Sequelize.col('birthday')), 'ASC']
        ]
    });
};


const getUpcomingBirthdaysIn1Month = async () => {
    const today = moment().utc();
    const endDate = today.clone().add(1, 'month');

    // Get MM-DD for today and endDate
    const startMMDD = today.format('MM-DD');
    const endMMDD = endDate.format('MM-DD');

    // If the period does not cross year boundary
    let dateCondition;
    if (startMMDD <= endMMDD) {
        dateCondition = {
            [Op.and]: [
                Sequelize.where(
                    Sequelize.fn('DATE_FORMAT', Sequelize.col('birthday'), '%m-%d'),
                    { [Op.between]: [startMMDD, endMMDD] }
                )
            ]
        };
    } else {
        // If the period crosses year boundary (e.g., Dec 15 to Jan 15)
        dateCondition = {
            [Op.or]: [
                Sequelize.where(
                    Sequelize.fn('DATE_FORMAT', Sequelize.col('birthday'), '%m-%d'),
                    { [Op.gte]: startMMDD }
                ),
                Sequelize.where(
                    Sequelize.fn('DATE_FORMAT', Sequelize.col('birthday'), '%m-%d'),
                    { [Op.lte]: endMMDD }
                )
            ]
        };
    }

    return await Talent.findAll({
        where: {
            inactive: false,
            ...dateCondition
        },
        include: [
            {
                model: Agencies,
                as: 'agency',
                where: {
                    name: { [Op.in]: ['Commit Offshore', 'ITSoft'] }
                },
                required: true
            }
        ],
        order: [
            [Sequelize.fn('MONTH', Sequelize.col('birthday')), 'ASC'],
            [Sequelize.fn('DAY', Sequelize.col('birthday')), 'ASC']
        ]
    });
};


const getUpcomingBirthdaysIn1Days = async () => {
    const today = moment().utc();
    const targetDate = today.clone().add(1, 'days');

    const targetMonth = targetDate.month() + 1; // month() is 0-indexed
    const targetDay = targetDate.date();

    return await Talent.findAll({
        where: {
            [Op.and]: [
                { inactive: false },
                Sequelize.where(
                  Sequelize.fn('MONTH', Sequelize.col('birthday')),
                  targetMonth
                ),
                Sequelize.where(
                  Sequelize.fn('DAY', Sequelize.col('birthday')),
                  targetDay
                ),
                {
                    agencyName: { [Op.in]: ['Commit Offshore', 'ITSoft'] },
                },
            ],
        },
        order: [
            [Sequelize.fn('MONTH', Sequelize.col('birthday')), 'ASC'],
            [Sequelize.fn('DAY', Sequelize.col('birthday')), 'ASC'],
        ],
    });
};


const getUpcomingBirthdaysCustomersIn1Days = async () => {
    const today = moment().utc();
    const targetDate = today.clone().add(1, 'days');

    return await Customer.findAll({
        where: {
            [Op.and]: [
                { inactive: false },
                Sequelize.where(
                  Sequelize.fn('DAYOFYEAR', Sequelize.col('birthday')),
                  {
                      [Op.between]: [
                          today.dayOfYear(),
                          targetDate.dayOfYear()
                      ]
                  }
                ),
            ]
        },
        order: [
            [Sequelize.fn('DAYOFYEAR', Sequelize.col('birthday')), 'ASC']
        ]
    });
};

const getUpcomingAnniversaries = async (type = '') => {
    const today = moment();
    const endDate = moment().add(type === '' ? 3 : 0, 'days');

    // console.log('today', today.format('YYYY-MM-DD'), 'endDate', endDate.format('YYYY-MM-DD'));

    const oneYearAgo = moment().subtract(1, 'year');

    const talents = await Talent.findAll({
        where: {
            [Op.and]: [
                Sequelize.where(Sequelize.fn('DATE_FORMAT', Sequelize.col('startDate'), '%m-%d'),
                  { [Op.between]: [today.format('MM-DD'), endDate.format('MM-DD')] }
                ),
                { startDate: { [Op.lte]: today.clone().subtract(1, 'year').add(type === '' ? 3 : 0, 'days').format('YYYY-MM-DD') } }
            ]
        },
        order: [['startDate', 'ASC']],
        attributes: ['id', 'fullName', 'startDate', 'email'],
        raw: true,
    });

    return talents;
};

function filterHolidays(holidays) {
    const today = moment();
    const currentMonthNumber = today.month() + 1;
    const currentDayNumber = today.date();
    return holidays.filter(holiday => {
        const { month, day } = holiday.date.datetime;
        return month === currentMonthNumber && day >= currentDayNumber;
    }).sort((a, b) => {
        if (a.date.datetime.month !== b.date.datetime.month) {
            return a.date.datetime.month - b.date.datetime.month;
        } else {
            return a.date.datetime.day - b.date.datetime.day;
        }
    });
}


module.exports = {
    getHolidaysForCountry,
    isISODayAsHoliday,
    filterNonHolidayDaysFromArrayOfISODays,
    getUpcomingAnniversaries,
    getUpcomingHolidays,
    getUpcomingBirthdaysIn3Days,
    getHolidaysForNotification,
    getHolidaysForCustomers,
    getHolidaysForOnyDayNotification,
    getUpcomingBirthdaysCustomersIn1Days,
    getUpcomingBirthdaysIn1Month
}
