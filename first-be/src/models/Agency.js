module.exports = (sequelize, DataTypes) => {
  const Agency = sequelize.define('Agencies', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ],
  })

  Agency.associate = models => {
    // This creates the reverse relationship where an agency can have many talents
    Agency.hasMany(models.Talent, { foreignKey: 'agencyId', as: 'talents' });
  };

  return Agency;
}
