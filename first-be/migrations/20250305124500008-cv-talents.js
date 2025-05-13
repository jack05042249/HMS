'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Talents', 'cv');

    await queryInterface.addColumn('Talents', 'cv', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Talents', 'cv');

    await queryInterface.addColumn('Talents', 'cv', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
  }
};
