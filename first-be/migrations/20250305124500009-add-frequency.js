'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Talents', 'feedbackFrequency', {
      type: Sequelize.ENUM('1w', '2w', '1m', '3m'),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Talents', 'feedbackFrequency', {
      type: Sequelize.ENUM('1w', '2w', '1m'),
      allowNull: true,
      defaultValue: null,
    });
  }
};
