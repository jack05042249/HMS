'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TasksEmployee', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      talentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Talents',
          key: 'id',
        },
      },
      comment: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      risk: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'CLOSED'),
        allowNull: false,
        defaultValue: 'OPEN',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TasksEmployee');
  },
};
