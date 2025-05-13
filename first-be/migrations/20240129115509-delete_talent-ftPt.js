'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Talents', 'ftPt');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Talents', 'ftPt', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
