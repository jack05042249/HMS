'use strict';

const cryptoJS = require('crypto-js')

const encryptPassword = (pass) => {
  return cryptoJS.AES.encrypt(pass, 'ITMSKEYCrypto').toString()
}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate('Talents', {
      password: encryptPassword("Aa123456!"),
    }, {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate('Talents', {
      password: "",
    }, {});
  }
};
