const LOGZ_IO = require('logzio-nodejs');

const logzio = LOGZ_IO.createLogger({
    token: 'ISXJoLtKTEJlmIwTXblOHKmviqUuqnPF',
    protocol: 'https',
    host: 'listener-eu.logz.io',
    port: '8071',
});


function logger(message, jsonData) {
    const msgStr = `[${global.APP_ENV}] ${message}`;
    const dataMessage = jsonData ? `Data: ${JSON.stringify(jsonData)}` : '';

    const res = `${msgStr} ${dataMessage}`;
    try {
        logzio.log(res);
        console.log('---------------------LOGZ.IO-----------------------');
        console.warn(`to send: ${res}`);
        console.log('---------------------LOGZ.IO END-----------------------');
    } catch (e) {
        console.error(`Error while sending log to logz.io: ${e.message}`);
    }
}

module.exports = {logger}
