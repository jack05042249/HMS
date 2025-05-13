'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('HrFeedbacks', {
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
          key: 'id'
        }
      },
      hrName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hrEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      risk: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
      },
      actionItems: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      feedbackDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      picture: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('HrFeedbacks');
  },
};
