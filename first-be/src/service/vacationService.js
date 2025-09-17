const { Talent, VacationHistory, VacationBalance } = require('../models')
const { vacationBalance, VACATIONS_TYPES } = require('../constants/vacationBalances')
const moment = require('moment')
const {
  sendEmployeeNotificationOnVacationManipulate,
  sendMailToEmployeeOnChangeVacationBalance,
  sendTalentListToAdminOnNovember
} = require('./emailService')
const { getTalentById } = require('./talentsService')
const { Op } = require('sequelize')
const { GenericError } = require('../utils/customError')
const {
  getHolidaysForCountry,
  isISODayAsHoliday,
  filterNonHolidayDaysFromArrayOfISODays
} = require('./holidayService')
const {
  isStartDateCurrentYear,
  getDateMonthNumber,
  getMonthCountFromDateTillEndOfYear,
  getDaysFractionOfMonth
} = require('../utils/date.func')
const { MATH_UTIL, isWeekend } = require('../utils/util')

const createVacation = async (talentId, vacationData) => {

  const talent = await Talent.findByPk(talentId)

  const existingVacation = await VacationHistory.findOne({
    where: {
      talentId: talent.id,
      startDate: vacationData.startDate,
      approved: true
    }
  })

  if (existingVacation) {
    throw new GenericError(400, 'Cannot take vacation on the same day as existing vacation')
  }

  const vacation = await VacationHistory.create({
    ...vacationData,
    talentId: talent.id,
    approved: true
  })

  await sendEmployeeNotificationOnVacationManipulate(talent.email, vacationData, talent.fullName, 'approved')

  return vacation
}
const getExpectVacations = async () => {
  const vacations = await VacationHistory.findAll({
    where: {
      approved: false
    }
  })
  return vacations
}
const approvedVacations = async () => {
  const currentYear = moment().year()

  const startOfYear = moment(`${currentYear}-01-01`).format('YYYY-MM-DD')
  const endOfYear = moment(`${currentYear}-12-31`).format('YYYY-MM-DD')

  const vacations = await VacationHistory.findAll({
    where: {
      approved: true,
      createdAt: {
        [Op.between]: [startOfYear, endOfYear]
      }
    },
    include: [{
      model: Talent,
      as: 'talent',
      attributes: ['id', 'fullName']
    }]
  })

  return vacations
}
const approveVacation = async (id) => {
  const approvedVacation = await VacationHistory.findByPk(id)
  approvedVacation.approved = true

  const vacation = await getVacationById(id)
  const talent = await getTalentById(vacation.talentId)

  await approvedVacation.save()
  await sendEmployeeNotificationOnVacationManipulate(talent.email, vacation, talent.fullName, 'approved')

  return approvedVacation
}
const rejectVacation = async (id) => {
  const vacation = await getVacationById(id)

  const talent = await getTalentById(vacation.talentId)

  await sendEmployeeNotificationOnVacationManipulate(talent.email, vacation, talent.fullName, 'rejected')

  return !!(await VacationHistory.destroy({
      where: { id }
    }
  ))
}
const changeVacationBalance = async (talentId, userId, data) => {
  const talent = await getTalentById(talentId)

  await sendMailToEmployeeOnChangeVacationBalance(talent.email, data, talent.fullName)

  return VacationBalance.create({
    talentId,
    userId,
    ...data
  })
}
const getTalentRemainedBalanceValues = async (talentId, fixedBalances) => {

  const { vacationDays, sickDays, unpaidDays } = fixedBalances

  const talent = await getTalentById(talentId)
  const { location } = talent
  const isUkraine = location === 'ua'

  const holidays = await getHolidaysForCountry(location, isUkraine)

  const approvedVacationRequests = await getTalentApprovedVacationRequestsByType(talentId, 'vacation')
  const approvedSickRequests = await getTalentApprovedVacationRequestsByType(talentId, 'sick')
  const approvedUnpaidRequests = await getTalentApprovedVacationRequestsByType(talentId, 'unpaid')

  if (approvedVacationRequests || approvedSickRequests || approvedUnpaidRequests) {

    const usedTalentVacationDaysByType = await calculateUsedDaysByType(approvedVacationRequests, holidays)

    const usedTalentSickDaysByType = await calculateUsedDaysByType(approvedSickRequests, holidays)

    const usedTalentUnpaidDaysByType = await calculateUsedDaysByType(approvedUnpaidRequests, holidays)

    return {
      vacationDays: vacationDays - usedTalentVacationDaysByType,
      sickDays: sickDays - usedTalentSickDaysByType,
      unpaidDays: unpaidDays - usedTalentUnpaidDaysByType
    }
  }
}


const getTalentGrantedValues = async (talentId) => {
  /*
  * api to get GRANTED values. Granted is the value that assigns to talent when:
  granted could be:
  1. if employee works second+ year: default 20,5,365
  2. if employee works second+ year: custom  changed by admin, saved in db as custom
  3. if employee works from some of the year month (firs year of work): calculate by Mila`s formula from doc

  * */
  const talent = await getTalentById(talentId)

  const isTalentStartDayOfWorkCurrentYear = isStartDateCurrentYear(talent.startDate)
  const defaultGrantedValues = await getTalentFixedBalancesValues(talentId) // todo refactor and add "for current year", need to migrate db with "year column"

  if (isTalentStartDayOfWorkCurrentYear) {
    const grantedVacations = grantedFormula(defaultGrantedValues.vacationDays, talent.startDate);
    const grantedSick = grantedFormula(defaultGrantedValues.sickDays, talent.startDate);
    return {
      vacationDays: grantedVacations,
      sickDays: grantedSick,
      unpaidDays: defaultGrantedValues.unpaidDays,
      civilDutyDays: defaultGrantedValues.civilDutyDays,
      bonusDays: defaultGrantedValues.bonusDays,
    };
  } else {
    return defaultGrantedValues
  }
}

function grantedFormula(fixedGranted, startDate) {
// formula: (20/12) * (month amount left + fraction)
  // fraction: ((month days - day started) / month days) )
  const monthAmountLeft = getMonthCountFromDateTillEndOfYear(startDate)

  const monthFraction = getDaysFractionOfMonth(startDate)

  const formula = MATH_UTIL.multiply(MATH_UTIL.divide(fixedGranted, 12), MATH_UTIL.add(monthAmountLeft, monthFraction))

  return MATH_UTIL.roundToInt(formula)
}

const getTalentFixedBalancesValues = async (talentId) => {
  const customTalentVacationBalance = await VacationBalance.findOne({
    where: {
      talentId
    },
    attributes: ['vacationDays', 'sickDays', 'unpaidDays', 'civilDutyDays', 'bonusDays'],
  })

  return customTalentVacationBalance ? customTalentVacationBalance : vacationBalance
}

const isTalentHaveUniqueBalanceValues = async (talentId) => {
  const vacationBalance = await VacationBalance.findOne({
    where: {
      talentId
    }
  })
  return vacationBalance ? vacationBalance : false
}

const getTalentApprovedVacationRequestsByType = (talentId, type) => {
  const currentYear = moment().year()

  const startOfYear = moment(`${currentYear}-01-01`).format('YYYY-MM-DD')
  const endOfYear = moment(`${currentYear}-12-31`).format('YYYY-MM-DD')

  return VacationHistory.findAll({
    where: {
      talentId: talentId,
      approved: true,
      type: type,
      [Op.or]: [
        { startDate: { [Op.between]: [startOfYear, endOfYear] } },
        { endDate: { [Op.between]: [startOfYear, endOfYear] } },
        {
          startDate: { [Op.lte]: startOfYear },
          endDate: { [Op.gte]: endOfYear }
        }
      ]

    }
  })
}

function initializeMonths() {
  const currentYear = moment().year()
  const months = {}
  for (let i = 0; i < 12; i++) {
    const month = moment().year(currentYear).month(i).format('MMMM')
    months[month] = {
      totalVacation: 0,
      totalSick: 0,
      totalUnpaid: 0
      // totalUsed: 0 //todo no need (for now), need to check
    }
  }
  return months
}


/*
  @calculateYearlyUsedDays should calculate used days PER MONTH
  there could be records that includes 2 month, for example July 29 -> Aug 12, there are 2 month in-between start and end date of vacation request.
  The function should calculate days user PER 1  month separately and also include holidays and weekdays

 */
function calculateYearlyUsedDays(vacationRequests, holidays, workFromMonday) {
  const usedDaysPerMonth = initializeMonths(); // Initialize for the year 2024

  vacationRequests.forEach(record => {
    let typeName;
    switch (record.type) {
      case VACATIONS_TYPES.VACATION:
        typeName = 'totalVacation';
        break;
      case VACATIONS_TYPES.SICK:
        typeName = 'totalSick';
        break;
      case VACATIONS_TYPES.UNPAID:
        typeName = 'totalUnpaid';
        break;
    }

    let start = moment(record.startDate);
    const end = moment(record.endDate);

    while (start.isSameOrBefore(end)) {
      const month = start.format('MMMM');
      const dayOfWeek = start.day();
      const isHoliday = isISODayAsHoliday(start.format('YYYY-MM-DD'), holidays);
      
      if (((workFromMonday && dayOfWeek !== 6 && dayOfWeek !== 0) || (!workFromMonday && dayOfWeek !== 5 && dayOfWeek !== 6)) && !isHoliday) {
        if (record.isHalfDay && start.isSame(moment(record.endDate), 'day')) {
          // Handle half-day logic correctly
          usedDaysPerMonth[month][typeName] += 0.5; // Adjust for half-day on the end date
        } else {
          // Only count full working days
          usedDaysPerMonth[month][typeName] += 1;
        }
      }

      start.add(1, 'day');
    }
  });

  return {
    per_month: usedDaysPerMonth
  };
}


const calculateUsedDaysByType = async (historyRecords, holidaysResponse) => {
  let usedDays = 0

  for (const record of historyRecords) {
    usedDays += calculateDaysCountForRecord(record, holidaysResponse)
  }
  return usedDays
}

function calculateDaysCountForRecord(record, holidaysResponse) {
  const currentYear = moment().year();
  let start = moment(record.startDate).year() < currentYear ? moment(`${currentYear}-01-01`) : moment(record.startDate);
  let end = moment(record.endDate).year() > currentYear ? moment(`${currentYear}-12-31`) : moment(record.endDate);

  const requestDates = getDatesBetween(start, end);

  const nonHolidayDates = filterNonHolidayDaysFromArrayOfISODays(requestDates, holidaysResponse);

  const nonWeekendAndNonHolidayDates = nonHolidayDates.filter(d => !isWeekend(d));

  return record.isHalfDay ? nonWeekendAndNonHolidayDates.length / 2 : nonWeekendAndNonHolidayDates.length;
}


const getVacationById = async (id) => {
  const vacation = await VacationHistory.findOne({
    where: { id }
  })
  return vacation
}
const getVacationBalanceByTalentId = async (id) => {
  const vacationBalance = await VacationBalance.findOne({
    where: { talentId: id }
  })
  return vacationBalance
}
const updateVacationBalance = async (id, newData) => {
  const vacationBalance = await VacationBalance.findOne({ where: { talentId: id } })

  const talent = await getTalentById(vacationBalance.talentId)

  await sendMailToEmployeeOnChangeVacationBalance(talent.email, newData, talent.fullName)

  await vacationBalance.update(newData)

  return vacationBalance
}

const getMonthsDifference = (startDateOfVacation, talentStartDate, currentYearStart) => {
  return moment(talentStartDate).isAfter(currentYearStart)
    ? moment(startDateOfVacation).diff(moment(talentStartDate), 'months', true)
    : moment(startDateOfVacation).diff(moment(currentYearStart), 'months', true)
}

const calculateDays = (gainedDays, startDate, endDate, usedDays, isHalfDay) => {
  let requestedDays;
  if (isHalfDay) {
    requestedDays = 0.5;
  } else {
    requestedDays = daysRangeChecker(startDate, endDate);
  }

  // Allow negative remaining days (if usedDays exceeds gainedDays)
  const remainingDays = gainedDays - usedDays;

  // If the remaining days are less than requested days, it won't return null, it will just allow negative balance
  if (remainingDays < requestedDays) {
    return requestedDays; // Even if it goes into the negative balance
  } else {
    return requestedDays;
  }
}

const isOneMonthPlanningLimit = (startDate) => {
  const currentMonth = moment().format('YYYY-MM')
  const requestedMonth = moment(startDate).format('YYYY-MM')

  const monthsDifference = moment(requestedMonth).diff(currentMonth, 'months', true)

  return monthsDifference <= 1
}

const calculateVacationDays = async (talentId, vacationData) => {
  const talent = await getTalentById(talentId)
  const { location } = talent
  const isUkraine = location === 'ua'

  const holidays = await getHolidaysForCountry(location, isUkraine)

  const { startDate, endDate, type, isHalfDay } = vacationData

  const startMoment = moment(startDate)

  const approvedRequests = await getTalentApprovedVacationRequestsByType(talentId, type)

  const usedDaysByType = await calculateUsedDaysByType(approvedRequests, holidays)

  const gainedDays = await calculateGainedDays(talentId)

  const { gainedVacationDays, gainedSickDays, gainedUnpaidDays, gainedBonusDays } = gainedDays

  if (startMoment.isSameOrAfter(moment().startOf('year'))) {
    switch (type) {
      case 'vacation': {
        return calculateDays(gainedVacationDays, startDate, endDate, usedDaysByType, isHalfDay)
      }
      case 'sick': {
        return calculateDays(gainedSickDays, startDate, endDate, usedDaysByType, isHalfDay)
      }
      case 'unpaid': {
        return gainedUnpaidDays
      }
      case 'bonus': {
        return gainedBonusDays
      }
    }
  } else {
    throw new GenericError(400, 'You cannot book a vacation in another year')
  }
}

const calculateGainedDays = async (talentId) => {
  const fixedTalentVacationBalances = await getTalentFixedBalancesValues(talentId) // old variant
  // const grantedTalentVacationBalances = await getTalentGrantedValues(talentId);


  const { vacationDays, sickDays, unpaidDays, bonusDays } = fixedTalentVacationBalances
  const talent = await getTalentById(talentId)

  const currentYearStart = moment().startOf('year')
  const talentStartDate = moment(talent.startDate)

  const vacationDaysPerMonthGain = vacationDays / 12
  const sickDaysPerMonthGain = sickDays / 12

  let calcDifference
  if (talentStartDate.isAfter(currentYearStart)) {
    calcDifference = Math.floor(moment().diff(talentStartDate, 'months', true))
  } else {
    calcDifference = Math.floor(moment().diff(currentYearStart, 'months', true))
  }

  return {
    gainedVacationDays: calcDifference >= 1 ? Math.floor(calcDifference * vacationDaysPerMonthGain) : 0,
    gainedSickDays: calcDifference >= 1 ?  Math.floor(calcDifference * sickDaysPerMonthGain) : 0,
    gainedUnpaidDays: unpaidDays,
    gainedBonusDays: bonusDays,

  }
}

const getDatesBetween = (startDate, endDate) => {
  const dates = []
  let firstDayOfVacation = moment(startDate)
  const lastDayOfVacation = moment(endDate)

  while (firstDayOfVacation.isSameOrBefore(lastDayOfVacation, 'day')) {
    dates.push(firstDayOfVacation.format('YYYY-MM-DD'))
    firstDayOfVacation.add(1, 'days')
  }

  return dates
}


const getTalentAllUsedDays = async (talentId) => {
  const talent = await getTalentById(talentId)
  const { location } = talent
  const isUkraine = location === 'ua'

  const holidays = await getHolidaysForCountry(location, isUkraine)

  const approvedVacationRequests = await getTalentApprovedVacationRequestsByType(talentId, 'vacation')
  const approvedSickRequests = await getTalentApprovedVacationRequestsByType(talentId, 'sick')
  const approvedUnpaidRequests = await getTalentApprovedVacationRequestsByType(talentId, 'unpaid');
  const approvedBonusRequests = await getTalentApprovedVacationRequestsByType(talentId, 'bonus')

  if (approvedVacationRequests || approvedSickRequests || approvedUnpaidRequests || approvedBonusRequests) {
    const usedTalentVacationDaysByType = await calculateUsedDaysByType(approvedVacationRequests, holidays)
    const usedTalentSickDaysByType = await calculateUsedDaysByType(approvedSickRequests, holidays)
    const usedTalentUnpaidDaysByType = await calculateUsedDaysByType(approvedUnpaidRequests, holidays)
    const usedTalentBonusDaysByType = await calculateUsedDaysByType(approvedBonusRequests, holidays)

    return {
      usedVacationDays: usedTalentVacationDaysByType ? usedTalentVacationDaysByType : 0,
      usedSickDays: usedTalentSickDaysByType ? usedTalentSickDaysByType : 0,
      usedUnpaidDays: usedTalentUnpaidDaysByType ? usedTalentUnpaidDaysByType : 0,
      usedBonusDays:  usedTalentBonusDaysByType  ? usedTalentBonusDaysByType : 0,
    }
  }
}

const getTalentAvailableDaysAllTypes = async (talentId) => {

  const talentUsedDays = await getTalentAllUsedDays(talentId)

  const { usedVacationDays, usedSickDays, usedUnpaidDays, usedBonusDays } = talentUsedDays

  const gainedDays = await calculateGainedDays(talentId)

  const { gainedVacationDays, gainedSickDays, gainedUnpaidDays, gainedBonusDays } = gainedDays

  return {
    availableVacationDays: gainedVacationDays ? gainedVacationDays - usedVacationDays : 0,
    availableSickDays: gainedSickDays ? gainedSickDays - usedSickDays : 0,
    availableUnpaidDays: gainedUnpaidDays ? gainedUnpaidDays - usedUnpaidDays : 0,
    availableBonusDays: gainedBonusDays ? gainedBonusDays - usedBonusDays : 0
  }
}

const calculateLeftDaysFromGranted = async (talentId) => {
  const talentUsedDays = await getTalentAllUsedDays(talentId)
  const { usedVacationDays, usedSickDays, usedUnpaidDays } = talentUsedDays


}

const talentVacationHistory = async (talentId, page = 1, pageSize = 10) => {
  const currentYear = moment().year()

  const startOfYear = moment(`${currentYear}-01-01`).format('YYYY-MM-DD')
  const endOfYear = moment(`${currentYear}-12-31`).format('YYYY-MM-DD')

  const offset = (page - 1) * pageSize

  const vacationHistory = await VacationHistory.findAndCountAll({
    where: {
      approved: true,
      talentId: talentId,
      createdAt: {
        [Op.between]: [startOfYear, endOfYear]
      }
    },
    limit: pageSize,
    offset: offset
  })

  const totalItems = vacationHistory.count
  const totalPages = Math.ceil(totalItems / pageSize)

  return {
    currentPage: page,
    totalPages: totalPages,
    pageSize: pageSize,
    totalItems: totalItems,
    vacations: vacationHistory.rows
  }
}

const getOnLeaveTalentsToday = async (customTalentsIds = []) => {
  const today = moment.utc().startOf('day').toDate()
  const inTalentsQuery = customTalentsIds.length ? {
    talentId: {
      [Op.in]: customTalentsIds
    }
  } : {}

  const records = await VacationHistory.findAll({
    where: {
      ...inTalentsQuery,
      startDate: {
        [Op.lte]: today
      },
      endDate: {
        [Op.gte]: today
      }
    },
    include: [{
      model: Talent,
      as: 'talent',
      attributes: ['id', 'fullName', 'email'],
      where: {inactive: false}
    }]
  })

  return records.map(r => r.toJSON())
}

const getRequestById = async (id) => {
  return await VacationHistory.findOne({
    where: { id }
  })
}
const updateVacationRequest = async (vacationData) => {
  const { startDate, endDate, id } = vacationData

  const updatedRequestByAdmin = await VacationHistory.update(
    {
      startDate: startDate,
      endDate: endDate
    },
    {
      where: { id }
    }
  )
  return updatedRequestByAdmin
}

const checkNovemberTalentsGainedDays = async () => {
  let talentsArray = []
  const talents = await Talent.findAll()
  for (let talent of talents) {
    const availableDays = await getTalentAvailableDaysAllTypes(talent.id)
    const { availableVacationDays } = availableDays
    if (availableVacationDays >= 10) {
      talentsArray.push(talent)
    }
  }

  return await sendTalentListToAdminOnNovember(talentsArray)
}

const daysRangeChecker = (startDate, endDate) => {
  const start = moment(startDate)
  const end = moment(endDate)

  const daysArray = []
  for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
    daysArray.push(m.clone())
  }

  const holidaysDaysArray = daysArray.filter(day => day.day() !== 0 && day.day() !== 6)

  const businessDaysDifference = holidaysDaysArray.length

  return businessDaysDifference <= 10
}

module.exports = {
  createVacation,
  getExpectVacations,
  approveVacation,
  approvedVacations,
  rejectVacation,
  changeVacationBalance,
  getTalentRemainedBalanceValues,
  getVacationById,
  updateVacationBalance,
  getVacationBalanceByTalentId,
  calculateVacationDays,
  getTalentFixedBalancesValues,
  isOneMonthPlanningLimit,
  calculateGainedDays,
  getTalentAllUsedDays,
  getTalentAvailableDaysAllTypes,
  getOnLeaveTalentsToday,
  talentVacationHistory,
  isTalentHaveUniqueBalanceValues,
  updateVacationRequest,
  getRequestById,
  checkNovemberTalentsGainedDays,
  daysRangeChecker,
  calculateUsedDaysByType,
  calculateYearlyUsedDays,
  getTalentGrantedValues
}
