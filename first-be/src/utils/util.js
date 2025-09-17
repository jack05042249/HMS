const cryptoJS = require('crypto-js');
const { config } = require('../config');
const moment = require('moment');


const generatePassword = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const symbols = '@$!%*?&';
  const passwordLength = 8;
  let password = '';

  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  const randomIndex = Math.floor(Math.random() * symbols.length);
  const randomSymbol = symbols.charAt(randomIndex);

  return `${password.slice(0, 7)}${randomSymbol}${password.slice(7)}`;
};


const encryptPassword = (pass) => {
  return cryptoJS.AES.encrypt(pass, config.crypto_secret).toString()
}

const createEnum = (values) => {
  const enumObject = {};
  for (const val of values) {
    enumObject[val] = val;
  }
  return Object.freeze(enumObject);
}
const isNumber = (value) => typeof value === 'number';

const add = (a, b) => {
  if (!isNumber(a) || !isNumber(b)) {
    throw new Error('Values must be a number!');
  }

  return a + b;
};

const multiply = (a, b) => {
  if (!isNumber(a) || !isNumber(b)) {
    throw new Error('Values must be a number!');
  }

  return a * b;
};

const subtract = (a, b) => {
  if (!isNumber(a) || !isNumber(b)) {
    throw new Error('Values must be a number!');
  }

  return a - b;
};

const divide = (a, b) => {
  if (!isNumber(a) || !isNumber(b)) {
    throw new Error('Values must be a number!');
  }

  return a / b;
};

const isArray = (value) => Array.isArray(value);


const addMultiply = (numbersArray) => {
  if (!isArray(numbersArray)) {
    throw new Error('Argument must be an array!')
  }

  return numbersArray.reduce((a, n) => add(a, n), 0);
}
const roundDown = (number) => {
  if (!isNumber(number)) {
    throw new Error('Values must be a number!');
  }
  return Math.floor(number);
};
const roundUp = (number) => {
  if (!isNumber(number)) {
    throw new Error('Values must be a number!');
  }
  return Math.ceil(number)
};
const roundToInt = (number) => {
  if (!isNumber(number)) {
    throw new Error('Values must be a number!');
  }
  return Math.round(number)
};

const isWeekend = (date, workFromMonday = 1) => {
  const day = moment(date).day();
  return (workFromMonday && (day === 6 || day === 0)) || (!workFromMonday && (day === 5 || day === 6)); // 6 = Saturday, 0 = Sunday
};
const getFirstObjectKey = (obj) => {
  if (!obj) {
    return null
  }

  const keys = Object.keys(obj);
  return keys.length > 0 ? keys[0] : undefined;
}
const MATH_UTIL = {
  isNumber,
  add,
  subtract,
  multiply,
  divide,
  addMultiply,
  roundDown,
  roundToInt,
}
module.exports = {
  generatePassword,
  encryptPassword,
  createEnum,
  isWeekend,
  getFirstObjectKey,
  MATH_UTIL
}
