const { getUpcomingAnniversaries } = require('../../service/holidayService');
const { sendTalentsAnniversaryToHR } = require('../../service/emailService');


const sendAnniversaryNotification = async () => {
    console.log('====== Check anniversaries today ======');
    const talents = await getUpcomingAnniversaries('today');
    if (talents.length) {
        await sendTalentsAnniversaryToHR(talents);
    } else {
        console.log('====== No anniversaries today ======');
    }
};

module.exports = {
    sendAnniversaryNotification
}
