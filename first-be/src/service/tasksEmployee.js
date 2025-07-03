const { Talent, TasksEmployee, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create a new task for an employee
const createTaskEmployee = async ({ talentId, comment, risk, dueDate, status = 'OPEN' }) => {
  if (!talentId || !comment || !risk) {
    throw new Error('Required fields: talentId, comment, risk.');
  }
  const today = new Date();
  const formattedDueDate = dueDate ? new Date(dueDate) : today;

  return await TasksEmployee.create({
    talentId,
    comment,
    risk,
    status,
    dueDate: formattedDueDate,
  });
};

// Get tasks for an employee with optional filtering and sorting
const getTasksForEmployee = async ({ talentId, sortBy = 'dueDate', sortOrder = 'ASC', status, risk }) => {
  if (!talentId) {
    throw new Error('talentId is required.');
  }

  const queryOptions = {
    where: { talentId },
    include: [
      {
        model: Talent,
        where: { inactive: false },
        attributes: []
      }
    ],
    order: [[sortBy, sortOrder]],
  };

  if (status) {
    queryOptions.where.status = status;
  }

  if (risk) {
    const riskArray = risk.split(',');
    queryOptions.where.risk = {
      [Op.in]: riskArray,
    };
  }

  return await TasksEmployee.findAll(queryOptions);
};

// Get task history for an employee
const getTaskEmployeeHistory = async (talentId) => {
  if (!talentId) {
    throw new Error('talentId is required.');
  }

  return await TasksEmployee.findAll({
    where: { talentId },
    include: [
      {
        model: Talent,
        where: { inactive: false },
        attributes: []
      }
    ],
    order: [['dueDate', 'ASC']],
  });
};

// Update task's comment and/or status for an employee
const updateEmployeeCommentByStatus = async (taskId, { comment, status, risk, dueDate }) => {
  const task = await TasksEmployee.findByPk(taskId);

  if (!task) {
    throw new Error('Task not found.');
  }

  const updatedFields = {};

  if (comment) updatedFields.comment = comment;

  if (status) updatedFields.status = status;

  if (risk) updatedFields.risk = risk;

  if (dueDate) updatedFields.dueDate = new Date(dueDate);

  return await task.update(updatedFields);
};

// Get all tasks for employees with optional filters
const getAllEmployeeTasks = async ({ status, risk, startDate, endDate, sortBy = 'dueDate', sortOrder = 'ASC', }) => {
  const queryOptions = {
    where: {}, // Initialize where clause as an empty object
    include: [
      {
        model: Talent,
        where: { inactive: false },
        attributes: []
      }
    ],
  };

  queryOptions.order = [[sortBy, sortOrder]];

  if (status) queryOptions.where.status = status;

  if (risk) {
    const riskArray = risk.split(',');
    queryOptions.where.risk = {
      [Op.in]: riskArray,
    };
  }

  if (startDate && endDate) {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    queryOptions.where.dueDate = {
      [Op.between]: [new Date(startDate), new Date(adjustedEndDate)],
    };
  }

  return await TasksEmployee.findAll(queryOptions);
};

const getEmployeeTaskDetails = async () => {
  return await TasksEmployee.findAll({
    attributes: [
      "talentId",
      [
        sequelize.literal(`(
                    SELECT MAX(dueDate) 
                    FROM TasksEmployee AS t 
                    WHERE t.talentId = TasksEmployee.talentId 
                    AND t.status = 'CLOSED'
                )`),
        "lastContactDate",
      ],
      [
        sequelize.literal(`(
                    SELECT MIN(dueDate) 
                    FROM TasksEmployee AS t 
                    WHERE t.talentId = TasksEmployee.talentId 
                    AND t.status = 'OPEN'
                )`),
        "nextContactDate",
      ],
      [
        sequelize.literal(`(
                    SELECT risk 
                    FROM TasksEmployee AS t 
                    WHERE t.talentId = TasksEmployee.talentId 
                    ORDER BY t.dueDate DESC 
                    LIMIT 1
                )`),
        "risk",
      ],
    ],
    include: [
      {
        model: Talent,
        where: { inactive: false },
        attributes: ["fullName"],
      },
    ],
    group: ["TasksEmployee.talentId", "Talent.id"],
  });
};

const deleteTaskTalentById = async (id) => {
  if (!id) {
    throw new Error('Task ID is required.');
  }

  const task = await TasksEmployee.findByPk(id);

  if (!task) {
    throw new Error(`Task with ID ${id} not found.`);
  }

  await task.destroy();

  return { message: `Task with ID ${id} deleted successfully.` };
};



module.exports = {
  createTaskEmployee,
  getTasksForEmployee,
  getTaskEmployeeHistory,
  updateEmployeeCommentByStatus,
  getAllEmployeeTasks,
  getEmployeeTaskDetails,
  deleteTaskTalentById
};
