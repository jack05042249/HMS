module.exports = (sequelize, DataTypes) => {
  const TasksCustomer = sequelize.define('TasksCustomer', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'id',
        onDelete: 'CASCADE'
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
    tableName: 'TasksCustomer',
    freezeTableName: true,
    timestamps: true,
  });

  TasksCustomer.associate = (models) => {
    TasksCustomer.belongsTo(models.Customer, { foreignKey: 'customerId', onDelete: 'CASCADE' });
  };

  return TasksCustomer;
};