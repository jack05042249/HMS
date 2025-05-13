'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('OrganizationsTalents', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      talentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Talents',
          key: 'id'
        }
      },
      organizationId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      },
    }).then( _ => {

      return queryInterface.addConstraint('OrganizationsTalents',  {
        fields: ['organizationId', 'talentId'],
        type: 'unique',
        name: 'unique_talent_org_pair'
      })

    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('OrganizationsTalents');
  }
};