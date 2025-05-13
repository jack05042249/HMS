module.exports = (sequelize, DataTypes) => {
  const TasksEmployee = sequelize.define('TasksEmployee', {
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
        model: 'Talents', // Ensure this matches the name of your Talents table
        key: 'id',
      },
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    risk: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED'),
      allowNull: false,
      defaultValue: 'OPEN',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'TasksEmployee',
    freezeTableName: true,
    timestamps: true,
  });

  TasksEmployee.associate = (models) => {
    TasksEmployee.belongsTo(models.Talent, { foreignKey: 'talentId' });
  };


  return TasksEmployee;
};
