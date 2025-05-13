'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Talents', 'linkedinProfile', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Talents', 'linkedinProfileChecked', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Talents', 'linkedinProfileDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Talents', 'linkedinProfile');
    await queryInterface.removeColumn('Talents', 'linkedinProfileChecked');
    await queryInterface.removeColumn('Talents', 'linkedinProfileDate');
  }
};
