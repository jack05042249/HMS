module.exports = (sequelize, DataTypes) => {
  const OrganizationsTalents = sequelize.define('OrganizationsTalents', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    talentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'Talents',
        key: 'id'
      }
    },
    organizationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'Organizations',
        key: 'id'
      }
    },
  },{
    timestamps: false
  });

  OrganizationsTalents.associate = models => {
    models.Talent.belongsToMany(models.Organization, { through: 'OrganizationsTalents' })
    models.Organization.belongsToMany(models.Talent, { through: 'OrganizationsTalents' })
  }


  return OrganizationsTalents
}