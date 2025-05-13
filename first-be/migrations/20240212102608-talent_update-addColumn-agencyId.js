'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Talents', 'agencyId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Agencies',
        key: 'id'
      },
    });

    /*
    1. get all talents (id, agencyName);
    2. get all talents agencies names and choose unique = new Set([names])
    3. bulk create new agencies with names, but save talent -agency id reference pairs
    4. loop, get talent with agencyname = Agency.model(name), update talent.agencyId with Agency.name().id
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Talents', 'agencyId');
  }
};
