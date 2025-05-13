module.exports = (sequelize, DataTypes) => {
  const HrFeedbacks = sequelize.define('HrFeedbacks', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    talentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Talents',
        key: 'id'
      }
    },
    hrName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hrEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    risk: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      allowNull: false,
    },
    actionItems: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    feedbackDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    picture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });

  return HrFeedbacks;
};
