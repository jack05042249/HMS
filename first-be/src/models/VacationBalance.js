module.exports = (sequelize, DataTypes) => {
  const VacationBalance = sequelize.define('VacationBalance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    talentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vacationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sickDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unpaidDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    civilDutyDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bonusDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  });

  VacationBalance.belongsTo(sequelize.models.Talent, {
    foreignKey: 'talentId',
    targetKey: 'id',
    as: 'talent',
  });
  VacationBalance.belongsTo(sequelize.models.User, {
    foreignKey: 'userId',
    targetKey: 'id',
    as: 'user',
  })

  return VacationBalance;
};
