module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('Customer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false
        },

        organizationId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
            default: 'ua'
        },
        birthday: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        whatsup: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        inactive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['email']
            }
        ],
    })

    Customer.associate = models => {
        Customer.belongsToMany(models.Talent, {
            through: 'TalentCustomer'
        });
        Customer.hasMany(models.TalentCustomer, { onDelete: 'cascade' });
        Customer.belongsTo(models.Organization, { foreignKey: 'organizationId', onDelete: 'cascade' })
    };



    Customer.beforeCreate(user => {
        user.email = user.email.toLowerCase();
    });

    Customer.beforeUpdate(user => {
        if (user.email) user.email = user.email.toLowerCase();
    });

    Customer.associate = (models) => {
        Customer.belongsToMany(models.Talent, {
            through: 'TalentCustomer',
        });
        Customer.hasMany(models.TalentCustomer, { onDelete: 'cascade' });
        Customer.belongsTo(models.Organization, { foreignKey: 'organizationId', onDelete: 'cascade' });


        Customer.hasMany(models.TasksCustomer, {
            foreignKey: 'customerId', // Ensure this matches the foreign key in TasksCustomer
            onDelete: 'cascade', // Optional: cascade delete tasks when a customer is deleted
        });
        Customer.hasMany(models.Talent, {
            foreignKey: "talentMainCustomer",
            as: "talents",
        });
    };
    return Customer
}