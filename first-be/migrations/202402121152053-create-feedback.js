'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Feedbacks', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            talentId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                references: {
                    model: 'Talents',
                    key: 'id'
                }
            },
            status: {
                type: Sequelize.ENUM,
                values: ['sent', 'resent', 'answered', 'overdue'],
                allowNull: false,
            },
            answers: {
                type: Sequelize.TEXT('long'),
                allowNull: true,
                defaultValue: null
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Feedbacks');
    }
};
