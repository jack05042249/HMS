const countryToCode = Object.freeze({
    Ukraine: 'ua',
    Israel: 'il',
    Armenia: 'am',
    Belarus: 'by',
    Azerbaijan: 'az',
    Poland: 'pl',
    Kazakhstan: 'kz',
    'United Kingdom': 'gb',
    Georgia: 'ge',
    Cyprus: 'cy',
    'United States': 'us',
    Moldova: 'md',
    Philippines: 'ph',
    Bulgaria: 'bg',
    Portugal: 'pt',
    Canada: 'ca',
    Germany: 'de',
    ru: 'Russia',
    hr: 'Croatia',
    Spain: 'es',
    'Czech Republic': 'cz',
    Romania: 'ro',
    Italy: 'it',
    Greece: 'gr'
});

const codeToCountry = Object.freeze({
    ua: 'Ukraine',
    il: 'Israel',
    am: 'Armenia',
    by: 'Belarus',
    az: 'Azerbaijan',
    pl: 'Poland',
    kz: 'Kazakhstan',
    gb: 'United Kingdom',
    ge: 'Georgia',
    cy: 'Cyprus',
    us: 'United States',
    md: 'Moldova',
    ph: 'Philippines',
    bg: 'Bulgaria',
    pt: 'Portugal',
    ca: 'Canada',
    de: 'Germany',
    ru: 'Russia',
    hr: 'Croatia',
    es: 'Spain',
    cz: 'Czech Republic',
    ro: 'Romania',
    it: 'Italy',
    gr: 'Greece'
});

const countryCodes = Object.keys(codeToCountry);
const countryNames = Object.keys(countryToCode);

module.exports = { countryToCode, codeToCountry, countryCodes, countryNames }

