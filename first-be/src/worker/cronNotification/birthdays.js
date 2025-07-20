const { sendTalentBirthdaysToHR, sendCustomerBirthdaysToHR } = require('../../service/emailService');
const { getHolidaysForOnyDayNotification, getHolidaysForCustomers } = require('../../service/holidayService');

const sendTalentBirthdaysNotification = async () => {
    console.log('====== Check upcoming birthdays ======');
    const { talents, talentsForToday, ...dateData} = await getHolidaysForOnyDayNotification();
    const { customers, ...data} = await getHolidaysForCustomers();
    await sendTalentBirthdaysToHR(talents, talentsForToday, dateData);
    if (talents.length == 0) {
        console.log('====== No birthdays in 1 day ======');
    }

    if (customers.length > 0) {
        await sendCustomerBirthdaysToHR(customers, data);
    } else {
        console.log('====== No birthdays in 1 day ======');
    }
}

module.exports = {
    sendTalentBirthdaysNotification
}
