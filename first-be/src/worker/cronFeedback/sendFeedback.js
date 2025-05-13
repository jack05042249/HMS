const { proceedToOverdue, proceedToResend, proceedToCreate } = require('../../service/feedbackService')

const sendNewFeedbackEmail = async () => {
    await proceedToCreate();
}

const checkAndReSendFeedbackEmail = async () => {
    await proceedToResend();
}

const checkOverdueFeedbackEmail = async () => {
    await proceedToOverdue();
}

module.exports = {
    sendNewFeedbackEmail,
    checkAndReSendFeedbackEmail,
    checkOverdueFeedbackEmail
}
