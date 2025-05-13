const { getCustomersWithTalents } = require("../../service/customersService")
const { config } = require('../../config');
const moment = require("moment");
const { default: axios } = require("axios");
const { get } = require("lodash");
const { sendHolidaysEmail } = require("../../service/emailService");
const { delay } = require("../../utils/delay");

const { getHolidaysForCountry } = require('../../service/holidayService');

const sendCronNotification = async (year, startDate, endDate) => {
    try {
        const holidaysPerCountry = {}
        const emailSendTo = {}
        const customersAndTalents = await getCustomersWithTalents();

        for (const customer of customersAndTalents) {
            const { id, fullName, email, Talents } = customer
            for (const tal of Talents) {
                const { fullName: talentName, location } = tal
                if (!holidaysPerCountry[location]) {
                    holidaysPerCountry[location] = []
                    const isUkraine = location === 'ua'
                    const holidays = await getHolidaysForCountry(location, isUkraine, year, true);

                    if (Object.keys(holidays).length) {
                        for (const date in holidays) {
                            const hl = holidays[date];
                            if (moment(date).isBetween(startDate, endDate)) {
                                if (isUkraine && !hl.primary_type.includes('National')) continue;
                                holidaysPerCountry[location].push({ name: isUkraine ? hl.name.replace('(Suspended)', '') : hl.name, date: moment.utc(date).toDate() })
                            }
                        }
                    }
                    await delay() // add delay here because free calendarific account allows to do 1 request per second.
                }
                if (holidaysPerCountry[location].length) {
                    if (emailSendTo[id]) {
                        emailSendTo[id][location] ?
                            emailSendTo[id][location].talents.push(talentName) :
                            emailSendTo[id][location] = { talents: [talentName], holidays: holidaysPerCountry[location] }
                    } else {
                        emailSendTo[id] = {
                            fullName,
                            email,
                            [location]: {
                                holidays: holidaysPerCountry[location],
                                talents: [talentName]
                            }
                        }
                    }
                }
            }

        }
        if (Object.keys(emailSendTo).length) {
            for (const customer of Object.values(emailSendTo)) {
                await sendHolidaysEmail(customer, startDate, endDate)
            }
        }
    } catch (error) {
        console.error(error)
    }

}

module.exports = { sendCronNotification }
