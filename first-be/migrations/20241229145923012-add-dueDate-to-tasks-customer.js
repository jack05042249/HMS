'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TasksCustomer', 'dueDate', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TasksCustomer', 'dueDate');
  },
};
