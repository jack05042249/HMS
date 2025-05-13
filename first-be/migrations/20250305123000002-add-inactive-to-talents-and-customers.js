'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('Talents', 'inactive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // Add column to Customers table
    await queryInterface.addColumn('Customers', 'inactive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove column from Talents table
    await queryInterface.removeColumn('Talents', 'inactive');

    // Remove column from Customers table
    await queryInterface.removeColumn('Customers', 'inactive');
  }
};
