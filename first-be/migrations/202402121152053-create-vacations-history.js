'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('VacationHistories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            type: {
                allowNull: false,
                type: Sequelize.ENUM('vacation', 'sick', 'unpaid', 'civil')
            },
            startDate: {
                allowNull: false,
                type: Sequelize.DATE
            },
            endDate: {
                allowNull: false,
                type: Sequelize.DATE
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            approved: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            talentId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Talents',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('VacationHistories');
    }
};
