module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['email']
            }
        ],
    })

    User.beforeCreate(user => {
        user.email = user.email.toLowerCase();
    });

    User.beforeUpdate(user => {
        if (user.email) user.email = user.email.toLowerCase();
    });

    return User
}