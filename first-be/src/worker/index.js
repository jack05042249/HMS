const cron = require('node-cron')
const { sendCronNotification } = require('./cronNotification/sendCronNotification')
const moment = require('moment')
const { Op } = require('sequelize')
const { sendTalentBirthdaysNotification } = require('./cronNotification/birthdays')
const { sendAnniversaryNotification } = require('./cronNotification/anniversary')
const {
  sendNewFeedbackEmail,
  checkAndReSendFeedbackEmail,
  checkOverdueFeedbackEmail
} = require('./cronFeedback/sendFeedback')
const { linkedinStatusCheck } = require('./linkedinStatusCheck')
const { logger } = require('./../utils/logger')
const { checkNovemberTalentsGainedDays } = require('../service/vacationService')
const { VacationBalance } = require('../models')

const everyJanuary1stAtMidnight = '0 0 1 1 *'

const resetBonusDaysCron = cron.schedule(everyJanuary1stAtMidnight, async () => {
  console.log('[CRON resetBonusDays] started: Resetting all bonusDays to NULL')

  try {
    await VacationBalance.update({ bonusDays: 0 }, { where: { bonusDays: { [Op.not]: 0 } } })

    console.log('[CRON resetBonusDays] completed successfully.')
  } catch (error) {
    console.error('[CRON resetBonusDays] failed:', error)
  }
})

const weeklyNotification = cron.schedule('0 0 12 * * 7', async () => {
  /*
        Don't send weekly notifications between the 26th of December and the 2nd of January.
        Annual notifications will be send in this period of time.
    */
  console.log('=== weeklyNotification launched ===')
  if (moment().isBetween(moment('26/12', 'DD/MM'), moment('26/12', 'DD/MM').add(7, 'days'))) return
  const currentYear = moment().format('YYYY')
  const weekAfter = moment().startOf('d').add(1, 'week')
  const twoWeeksAfter = moment().endOf('d').add(13, 'days')
  console.log(`***  ${moment().format('DD/MM/YYYY')}-${moment(twoWeeksAfter).format('DD/MM/YYYY')} ***`)
  await sendCronNotification(currentYear, weekAfter, twoWeeksAfter, 'Sunday')
})

const weeklyNotificationforUkrainianHolidays = cron.schedule('0 0 12 * * 1', async () => {
  /*
        Don't send weekly notifications between the 26th of December and the 2nd of January.
        Annual notifications will be send in this period of time.
    */
  console.log('=== weeklyNotification launched ===')
  if (moment().isBetween(moment('26/12', 'DD/MM'), moment('26/12', 'DD/MM').add(7, 'days'))) return
  const lastSunday = moment().subtract(1, 'day')
  const currentYear = lastSunday.format('YYYY')
  const weekAfter = lastSunday.startOf('d').add(1, 'week')
  const twoWeeksAfter = lastSunday.endOf('d').add(13, 'days')
  console.log(`***  ${lastSunday.format('DD/MM/YYYY')}-${moment(twoWeeksAfter).format('DD/MM/YYYY')} ***`)
  await sendCronNotification(currentYear, weekAfter, twoWeeksAfter, 'Monday')
})

const annualNotification = cron.schedule('0 0 26 12 *', async () => {
  console.log('=== annualNotification launched ===')
  const year = moment().endOf('year').add(1, 'day').format('YYYY')
  const startDate = moment().endOf('year')
  const endDate = moment().endOf('year').add(1, 'year')
  console.log(`***  ${year} ***`)
  await sendCronNotification(year, startDate, endDate)
})

const frequency1Min = '* * * * *' // every minute
// const frequency = '*/5 * * * * *'; // every 5 sec
const everyDay9AM = '43 17 * * *' // every day at 09:00 am

const everyDayCron = cron.schedule(
  everyDay9AM,
  async () => {
    await sendTalentBirthdaysNotification()
    await sendAnniversaryNotification()
  },
  {
    timezone: 'Asia/Singapore' // or 'Asia/Shanghai', 'Asia/Hong_Kong', etc.
  }
//   {
//     timezone: 'Europe/Moscow' // or your preferred UTC+3 city
//   }
)

const everyMonday945AM = '45 9 * * MON'
const everyMondayCron = cron.schedule(everyMonday945AM, async () => {
  logger(`[CRON everyMonday945AM] started:  12:20`)
  await sendNewFeedbackEmail()
})

const everyWednesday945AM = '45 9 * * WED'
const everyWednesdayCron = cron.schedule(everyWednesday945AM, async () => {
  logger(`[CRON everyWednesday945AM] started: `)
  await checkAndReSendFeedbackEmail()
})

const everyFriday945AM = '45 9 * * FRI'
const everyFridayCron = cron.schedule(everyFriday945AM, async () => {
  logger(`[CRON everyFriday945AM] started: `)
  await checkOverdueFeedbackEmail()
})

const everyFirstDayOfNovember = '0 10 1 11 *'
const everyFirstOfNovemberCron = cron.schedule(everyFirstDayOfNovember, async () => {
  logger(`[CRON firstOfNovemberCron] started: `)
  await checkNovemberTalentsGainedDays()
})

// Run every day at 00:10
const linkedinCron = cron.schedule('6 20 * * *', async () => {
  const today = new Date()
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const todayDate = today.getDate()
  // Check if today is the 23rd day before the end of the month
  // if (todayDate === lastDayOfMonth - 22) {
  // logger(`[CRON linkedinCron] started: `);
  // await linkedinStatusCheck();
  // }
})

const croneExecutor = () => {
  weeklyNotification.start()
  weeklyNotificationforUkrainianHolidays.start()
  annualNotification.start()
  everyDayCron.start()

  console.log('first system start cron [everyMonday945AM]')
  everyMondayCron.start()

  console.log('first system start cron [everyWednesday945AM]')
  everyWednesdayCron.start()

  console.log('first system start cron [everyFriday945AM]')
  everyFridayCron.start()
  everyFirstOfNovemberCron.start()

  // linkedinCron.start();
}

module.exports = { croneExecutor }
