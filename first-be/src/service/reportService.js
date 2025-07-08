const {Talent, VacationHistory, Customer, Organization, Agencies} = require('../models');
const moment = require("moment/moment");
const {Op} = require('sequelize');
const {
    getTalentFixedBalancesValues,
    getTalentAllUsedDays,
    calculateYearlyUsedDays,
    getTalentGrantedValues
} = require('./vacationService');
const { getHolidaysForCountry, isISODayAsHoliday } = require('./holidayService');
const { MATH_UTIL } = require('../utils/util')


const processTalent = async (talent, startDate, endDate) => {
    const raw = talent.toJSON();
    raw.customers = raw.Customers.map(c => c.Organization);
    delete raw.Customers;

    const [balances, granted] = await Promise.all([
        getTalentAllUsedDays(talent.id),
        getTalentFixedBalancesValues(talent.id)
    ]);

    const { location } = talent;
    const isUkraine = location === 'ua';

    const holidays = await getHolidaysForCountry(location, isUkraine);

    const usedDates = talent.vacations.reduce((acc, vacation) => {
        const start = moment.utc(vacation.startDate);
        const end = moment.utc(vacation.endDate);
        const daysInRange = [];
        let currentDate = start.clone();
        while (currentDate.isSameOrBefore(end, 'day')) {
            if (currentDate.day() !== 0 && currentDate.day() !== 6) {
                daysInRange.push({
                    isHalfDay: vacation.type === 'vacation' || vacation.type === 'sick' ? vacation.isHalfDay : false,
                    date: currentDate.format('YYYY-MM-DD')
                });
            }
            currentDate.add(1, 'day');
        }
        const vacationType = vacation.type
        if (!acc[vacationType]) {
            acc[vacationType] = [];
        }
        acc[vacationType] = acc[vacationType].concat(daysInRange);

        return acc;
    }, {});

    const totalUsedDaysByType = {
        usedVacation: 0,
        usedSick: 0,
        usedUnpaid: 0
    };
    Object.keys(usedDates).forEach(type => {
        usedDates[type].forEach(dateObj => {
            const date = moment.utc(dateObj.date);

            if (date.isBetween(startDate, endDate, 'day', '[]')) {
                dateObj.isHoliday = isISODayAsHoliday(date.format('YYYY-MM-DD'), holidays);
                if (date.month() === moment.utc(dateObj.date).month() && !dateObj.isHoliday) {
                    if (type === 'vacation') {
                        if (dateObj.isHalfDay) {
                            totalUsedDaysByType.usedVacation += 0.5;
                        } else {
                            totalUsedDaysByType.usedVacation += 1;
                        }
                    } else if (type === 'sick') {
                        if (dateObj.isHalfDay) {
                            totalUsedDaysByType.usedSick += 0.5;
                        } else {
                            totalUsedDaysByType.usedSick += 1;
                        }
                    } else if (type === 'unpaid') {
                        totalUsedDaysByType.usedUnpaid += 1;
                    }
                }
            }
        });
    });

    raw.balances = balances;
    raw.granted = granted;
    raw.usedDates = usedDates;
    raw.usedByType = totalUsedDaysByType;

    return raw;
};

const getReport = async (payload) => {
    let { startDate, endDate, agencies, customers, type, tal } = payload;

    startDate = moment.utc(startDate).startOf('day').toDate();
    endDate = moment.utc(endDate).endOf('day').toDate();

    const whereConditions = {
        // inactive: false,
    };

    if (tal && tal.length) {
        whereConditions.id = { [Op.in]: tal };
    }

    if (agencies && agencies.length) {
        whereConditions.agencyId = { [Op.in]: agencies };
    }

    const organizationWhere = customers && customers.length ? {
        id: { [Op.in]: customers }
    } : undefined;

    const startOfYear = moment.utc().startOf('year').toDate();
    const endOfYear = moment.utc().endOf('year').toDate();

    const talents = await Talent.findAll({
        where: whereConditions,
        attributes: ['id', 'fullName', 'agencyId', 'location'],
        include: [
            {
                model: VacationHistory,
                attributes: ['startDate', 'endDate', 'type', 'isHalfDay'],
                as: 'vacations',
                required: false,
                where: {
                    startDate: { [Op.gte]: startOfYear, [Op.lte]: endOfYear },
                    endDate: { [Op.gte]: startOfYear, [Op.lte]: endOfYear },
                }
            },
            {
                model: Customer,
                attributes: ['id'],
                required: true,
                through: { attributes: [] },
                include: [{
                    model: Organization,
                    attributes: ['id', 'name'],
                    where: organizationWhere
                }]
            },
            {
                model: Agencies,
                attributes: ['id', 'name'],
                as: 'agency'
            }
        ],
    });

    if (type === 'monthly') {
        return await Promise.all(
          talents.map(t => processTalent(t, startDate, endDate))
        );
    } else if (type === 'year') {
        const yearlyReports = [];

        for (const talent of talents) {
            const yearlyReport = {
                talentId: talent.id,
                fullName: talent.fullName,
                agency: { name: talent.agency.name, id: talent.agency.id },
                customers: talent.Customers.map(c => ({
                    id: c.id,
                    name: c.Organization.name
                })),
                monthsData: {},
                totalUsed: 0,
                totalGranted: 0,
                totalLeft: 0
            };

            const { location } = talent;
            const isUkraine = location === 'ua';

            const holidays = await getHolidaysForCountry(location, isUkraine);
            const usedData = calculateYearlyUsedDays(talent.vacations, holidays);
            const granted = await getTalentFixedBalancesValues(talent.id);
            const totalUsed = await getTalentAllUsedDays(talent.id);

            yearlyReport.totalUsed = totalUsed;
            yearlyReport.totalGranted = granted;
            yearlyReport.totalLeft = {
                availableVacationDays: granted.vacationDays - totalUsed.usedVacationDays,
                availableSickDays: granted.sickDays ? MATH_UTIL.subtract(granted.sickDays, totalUsed.usedSickDays) : 0,
                availableUnpaidDays: granted.unpaidDays ? MATH_UTIL.subtract(granted.unpaidDays, totalUsed.usedUnpaidDays) : 0,
            };
            yearlyReport.monthsData = usedData.per_month;

            yearlyReports.push(yearlyReport);
        }

        return yearlyReports;
    }
};

module.exports = { getReport };
