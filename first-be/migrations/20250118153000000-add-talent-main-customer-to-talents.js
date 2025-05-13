'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Talents', 'talentMainCustomer', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Customers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Talents', 'talentMainCustomer');
  }
};
