module.exports = (sequelize, DataTypes) => {

    const TalentCustomer = sequelize.define('TalentCustomer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
    })

    TalentCustomer.associate = models => {
        models.Talent.belongsToMany(models.Customer, { through: 'TalentCustomer' })
        models.Customer.belongsToMany(models.Talent, { through: 'TalentCustomer' })
    }

    return TalentCustomer
}
