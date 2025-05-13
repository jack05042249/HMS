module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define('Feedbacks', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        talentId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'Talents',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM,
            values: ['sent', 'resent', 'answered', 'overdue'],
            allowNull: false,
        },
        answers: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
            defaultValue: null
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
        }
    });

    Feedback.associate = models => {
        Feedback.belongsTo(models.Talent, { foreignKey: 'talentId', as: 'talent' });
    }

    return Feedback;
}
