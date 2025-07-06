// import fs from "fs";
const {default: axios} = require('axios')
const {config} = require("../config");
const {GenericError} = require("../utils/customError");
const moment = require('moment/moment');
const { CALENDARIFIC_API_URL } = require('../constants/util.constants')
const fs = require("fs");
const API_KEYS = [...config.additional_calendarific_keys, config.calendarific_key];

const jsonFilePath = 'holidaysData.json';

const HOLIDAYS = new Map();

const readFile = async () => {
    try {
        const data = await fs.promises.readFile(jsonFilePath, 'utf8');
        if (!data.trim()) return {}; // Handle empty file gracefully
        return JSON.parse(data);
    } catch (e) {
        console.error(e);
        return undefined;
    }
}
const writeFile = async (data) => {
    await fs.promises.writeFile(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
}

const readStore = async (key) => {
    const data = await readFile();
    return data ? data[key]: null;
}

const writeStore = async (key, value) => {
    const read = await readFile();
    const payload = read ? read : {};

    payload[key] = value;
    await writeFile(payload);

}

const runAPIRequest = (key, data) => {
    const {year, country, isUkraine} = data;
    return axios.get(`${CALENDARIFIC_API_URL}?api_key=${key}&year=${year}&country=${country}${!isUkraine ? '&type=national' : ''}`)
}

const loadHolidays = async (payload) => {
    let currentIndex = 0;
    let holidays;

    while (!holidays && currentIndex < API_KEYS.length) {
        try {
            console.log(`Try to load holdiay data with API index [${currentIndex}]`)
            const {data} = await runAPIRequest(API_KEYS[currentIndex], payload);
            console.log(`Received data from API with index [${currentIndex}]:`, data);
            if (data.response.holidays) {
                holidays = data.response.holidays; // Array
                return holidays;
            }
            throw new Error('Holidays provide no data, try next key...')
        } catch (e) {
            console.error(e);
            currentIndex++;
            if (currentIndex === API_KEYS.length) {
                console.error('All Calendarific keys are used. Cannot receive data from Calendarific API. Please check tokens.');
            }
        }
    }
}

const getHolidaysForCountryCode = async (countryCode, isUkraine = false, year = null) => {
    const currentYear = year ? year : moment().format('YYYY');

    const storeData = await readStore(countryCode); // check if offline data exist

    // console.log(countryCode,' -- ', currentYear, ' == ', storeData ? storeData[0]['date']['datetime']['year'] : 'No holiday')

    if (!storeData || storeData[0]['date']['datetime']['year'] != currentYear) {
        const payload = {
            year: currentYear,
            country: countryCode,
            isUkraine
        };

        let apiData = await loadHolidays(payload); // load fresh data from API and store it

        if (isUkraine) {
            // filter ukraine list before save to store;
            apiData = filterUkrainianHolidays(apiData);
        }

        await writeStore(countryCode, apiData); // save received data to store for future offline use

        return apiData;
    }

    if (isUkraine) {
        // filter already saved data for ukraine
        return filterUkrainianHolidays(storeData);
    }

    return storeData;
}

function filterUkrainianHolidays(list) {
    let filteredList = [];
    list.forEach(hl => {
        if (hl.primary_type.includes('National')) {
            let refinedDate = moment(hl.date.iso).day() === 0 ? moment(hl.date.iso).add(1, 'day') : moment(hl.date.iso).day() === 6 ? moment(hl.date.iso).add(2, 'day') : moment(hl.date.iso);
            filteredList.push({
                name: hl.name.replace('(Suspended)', ''),
                date: {'iso' : refinedDate.format('YYYY-MM-DD'), 'datetime': {'year': parseInt(refinedDate.format('YYYY'), 10), 'month': parseInt(refinedDate.format('MM'), 10), 'day': parseInt(refinedDate.format('DD'), 10)}},
                primary_type: hl.primary_type
            });
        }
    });
    return filteredList;
}

module.exports = {
    getHolidaysForCountryCode
}
