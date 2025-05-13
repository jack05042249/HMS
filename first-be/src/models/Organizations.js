module.exports = (sequelize, DataTypes) => {
    const Organization = sequelize.define('Organization', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['name']
            }
        ],
    });

    Organization.associate = models => {
        Organization.hasMany(models.Customer, { foreignKey: 'organizationId', onDelete: 'cascade' })
    };

    return Organization;
};
