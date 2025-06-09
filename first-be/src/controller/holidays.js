const { GenericError } = require("../utils/customError")
const { getUpcomingBirthdaysIn1Month, getUpcomingBirthdaysIn3Days, getUpcomingAnniversaries, getUpcomingHolidays,  } = require('../service/holidayService');

const upcomingBirthdaysGet = async (req, res) => {
  try {
    const upcomingBirthdays = await getUpcomingBirthdaysIn1Month();

    return res.status(200).json(upcomingBirthdays)

  } catch (error) {
    console.error('Error:', error.message)
    const statusCode = error.statusCode || 500
    const errorMessage = error.message || 'Internal Server Error'
    res.status(statusCode).json({ error: errorMessage })
  }
}

const upcomingAnniversariesGet = async (req, res) => {
  try {
    const upcomingAnniversaries = await getUpcomingAnniversaries();

    return res.status(200).json(upcomingAnniversaries)

  } catch (error) {
    console.error('Error:', error.message)
    const statusCode = error.statusCode || 500
    const errorMessage = error.message || 'Internal Server Error'
    res.status(statusCode).json({ error: errorMessage })
  }
}

const upcomingHolidays = async (req, res) => {

  try {
    let upcomingHolidays = await getUpcomingHolidays(req.user);

    return res.status(200).json(upcomingHolidays);

  } catch (error) {
    console.error('Error:', error.message)
    const statusCode = error.statusCode || 500
    const errorMessage = error.message || 'Internal Server Error'
    res.status(statusCode).json({ error: errorMessage })
  }
}


module.exports = {
  upcomingBirthdaysGet,
  upcomingAnniversariesGet,
  upcomingHolidays
}
