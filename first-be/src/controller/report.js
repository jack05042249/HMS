const {getReport} = require('../service/reportService');


const getVacationsReport = async (req, res) => {
    try {
        const {customers = [], agencies = [], talents = [], ...dates} = req.query;

        const parsedCustomers = Array.isArray(customers) ? customers.map(c => parseInt(c, 10)) : [parseInt(customers, 10)];
        const parsedAgencies = Array.isArray(agencies) ? agencies.map(c => parseInt(c, 10)) : [parseInt(agencies, 10)];
        const parsedTalents = Array.isArray(talents) ? talents.map(c => parseInt(c, 10)) : [parseInt(talents, 10)];

        const payload = {
            ...dates,
            customers: parsedCustomers,
            agencies: parsedAgencies,
            tal: parsedTalents
        };

        const report = await getReport(payload);
        return res.status(200).json(report);
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).send(error.message);
    }
}

module.exports = {getVacationsReport};
