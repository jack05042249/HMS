'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Talents', 'position', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Talents', 'projectName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Talents', 'agencyName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Talents', 'startDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Talents', 'ftPt', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Talents', 'birthday', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Talents', 'address', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Talents', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Talents', 'position');
    await queryInterface.removeColumn('Talents', 'projectName');
    await queryInterface.removeColumn('Talents', 'agencyName');
    await queryInterface.removeColumn('Talents', 'startDate');
    await queryInterface.removeColumn('Talents', 'ftPt');
    await queryInterface.removeColumn('Talents', 'birthday');
    await queryInterface.removeColumn('Talents', 'address');
    await queryInterface.removeColumn('Talents', 'phoneNumber');
  },
};
