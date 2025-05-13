module.exports = (sequelize, DataTypes) => {
  const Vacation = sequelize.define('VacationHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('vacation', 'sick', 'unpaid', 'civil'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    talentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isHalfDay: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  Vacation.belongsTo(sequelize.models.Talent, {
    foreignKey: 'talentId',
    targetKey: 'id',
    as: 'talent',
  });

  return Vacation;
};
