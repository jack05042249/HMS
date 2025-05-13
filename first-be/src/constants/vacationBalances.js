const vacationBalance = Object.freeze({
  vacationDays: 20,
  sickDays: 5,
  unpaidDays: 365,
  civilDutyDays: 0,
  bonusDays: 0
});
const VACATIONS_TYPES = Object.freeze({
  VACATION: 'vacation',
  SICK: 'sick',
  UNPAID: 'unpaid',
  CIVIL: 'civil',
  BONUS: 'bonus',
})
module.exports = {
  vacationBalance,
  VACATIONS_TYPES
}
