const {countryToCode, codeToCountry} = require('../constants/countries');

const getCountries = async (req, res) => {

    return res.json({countryToCode, codeToCountry});
}
module.exports = {getCountries}
