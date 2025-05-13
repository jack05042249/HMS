'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Talents', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Talents', 'password');
  }
};