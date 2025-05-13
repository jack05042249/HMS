'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.addColumn('Talents', 'feedbackFrequency', {
            type: Sequelize.ENUM,
            values: ['1w', '2w', '1m'],
            allowNull: true,
            defaultValue: null,
        });
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.removeColumn('Talents', 'feedbackFrequency');
    }
};
