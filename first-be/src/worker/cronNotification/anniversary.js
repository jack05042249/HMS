const { getUpcomingAnniversaries } = require('../../service/holidayService');
const { sendTalentsAnniversaryToHR } = require('../../service/emailService');


const sendAnniversaryNotification = async () => {
    console.log('====== Check anniversaries today ======');
    const talentsForToday = await getUpcomingAnniversaries('today');
    const talents = await getUpcomingAnniversaries('tomorrow');
    if (talents.length || talentsForToday.length) {
        await sendTalentsAnniversaryToHR(talents, talentsForToday);
    } else {
        console.log('====== No anniversaries today ======');
    }
};

module.exports = {
    sendAnniversaryNotification
}
