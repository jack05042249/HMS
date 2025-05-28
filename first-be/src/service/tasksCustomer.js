const { TasksCustomer, TasksEmployee, Customer, Talent, Organization, sequelize } = require('../models')
const { Op } = require('sequelize')

// Create a new task for a customer
const createTaskCustomer = async ({ customerId, comment, risk, dueDate, status = 'OPEN' }) => {
  if (!customerId || !comment || !risk) {
    throw new Error('Required fields: customerId, comment, risk.')
  }

  const today = new Date()
  const formattedDueDate = dueDate ? new Date(dueDate) : today

  return await TasksCustomer.create({
    customerId,
    comment,
    risk,
    status,
    dueDate: formattedDueDate
  })
}

const deleteTaskCustomerById = async id => {
  if (!id) {
    throw new Error('Task ID is required.')
  }

  const task = await TasksCustomer.findByPk(id)

  if (!task) {
    throw new Error(`Task with ID ${id} not found.`)
  }

  await task.destroy()

  return { message: `Task with ID ${id} deleted successfully.` }
}

// Get tasks for a customer with optional filtering and sorting
const getTasksForCustomer = async ({ customerId, sortBy = 'dueDate', sortOrder = 'ASC', status, risk }) => {
  if (!customerId) {
    throw new Error('customerId is required.')
  }

  const queryOptions = {
    where: { customerId },
    include: [
      {
        model: TasksCustomer,
        where: { inactive: false },
        required: false
      }
    ],
    order: [[sortBy, sortOrder]]
  }

  if (status) queryOptions.where.status = status

  if (risk) {
    const riskArray = risk.split(',')
    queryOptions.where.risk = {
      [Op.in]: riskArray
    }
  }

  return await TasksCustomer.findAll(queryOptions)
}

// Get task history for a customer
const getTaskCustomerHistory = async customerId => {
  if (!customerId) {
    throw new Error('customerId is required.')
  }

  return await TasksCustomer.findAll({
    where: { customerId },
    order: [['dueDate', 'ASC']],
    include: [
      {
        model: TasksCustomer,
        where: { inactive: false },
        required: false
      }
    ]
  })
}

// Update task's comment and/or status for a customer
const updateCustomerCommentByStatus = async (taskId, { comment, status, risk, dueDate }) => {
  const task = await TasksCustomer.findByPk(taskId)
  if (!task) {
    throw new Error('Task not found.')
  }

  const updatedFields = {}

  if (comment) updatedFields.comment = comment

  if (status) updatedFields.status = status

  if (risk) updatedFields.risk = risk

  if (dueDate) updatedFields.dueDate = new Date(dueDate)

  return await task.update(updatedFields)
}

// Get all tasks with optional filters
const getAllCustomerTasks = async ({ status, risk, startDate, endDate, sortBy = 'dueDate', sortOrder = 'ASC' }) => {
  const queryOptions = {
    where: {} // Initialize where clause as an empty object
  }

  queryOptions.order = [[sortBy, sortOrder]]

  if (status) queryOptions.where.status = status

  if (risk) {
    const riskArray = risk.split(',')
    queryOptions.where.risk = {
      [Op.in]: riskArray
    }
  }

  if (startDate && endDate) {
    const adjustedEndDate = new Date(endDate)
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1)
    queryOptions.where.dueDate = {
      [Op.between]: [new Date(startDate), new Date(adjustedEndDate)]
    }
  }
  return await TasksCustomer.findAll(queryOptions)
}

const getCustomersAndTalentsWithoutTasks = async () => {
  return await Promise.all([
    Customer.findAll({
      attributes: ['id', 'fullName'],
      include: [
        {
          model: TasksCustomer,
          required: false,
          attributes: ['id'] // Now included
        },
        {
          model: Talent,
          as: 'talents',
          attributes: [],
          required: true,
          where: {
            talentMainCustomer: sequelize.col('Customer.id'),
            inactive: false
          }
        }
      ],
      where: {
        inactive: false,
        '$TasksCustomers.id$': null
      },
      group: ['Customer.id', 'TasksCustomers.id'], // Add this line
      having: sequelize.literal('COUNT(`talents`.`id`) > 0')
    }),
    Talent.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: TasksEmployee,
          required: false
        }
      ],
      where: {
        inactive: false,
        '$TasksEmployees.id$': null
      }
    })
  ])
}

const getCustomerTaskDetails = async () => {
  return await TasksCustomer.findAll({
    raw: true, // Important to prevent Sequelize auto-including primary key
    attributes: [
      'customerId',
      [
        sequelize.literal(`(
        SELECT MAX(dueDate) 
        FROM TasksCustomer AS t 
        WHERE t.customerId = TasksCustomer.customerId 
        AND t.status = 'CLOSED'
      )`),
        'csLastContactDate'
      ],
      [
        sequelize.literal(`(
        SELECT MIN(dueDate) 
        FROM TasksCustomer AS t 
        WHERE t.customerId = TasksCustomer.customerId 
        AND t.status = 'OPEN'
      )`),
        'csNextContactDate'
      ],
      [
        sequelize.literal(`(
        SELECT risk 
        FROM TasksCustomer AS t 
        WHERE t.customerId = TasksCustomer.customerId 
        ORDER BY t.dueDate DESC 
        LIMIT 1
      )`),
        'risk'
      ]
    ],
    include: [
      {
        model: Customer,
        where: { inactive: false },
        attributes: ['id', 'fullName'],
        include: [
          {
            model: Talent,
            as: 'talents',
            attributes: [],
            required: true,
            where: {
              talentMainCustomer: sequelize.col('Customer.id')
            }
          },
          {
            model: Organization,
            attributes: ['name']
          }
        ]
      }
    ],
    where: {
      customerId: {
        [Op.ne]: null
      }
    },
    group: ['TasksCustomer.customerId', 'Customer.id'],
    having: sequelize.literal(`Customer.id IS NOT NULL`)
  })
}

module.exports = { getCustomerTaskDetails }

module.exports = {
  createTaskCustomer,
  getTasksForCustomer,
  getTaskCustomerHistory,
  updateCustomerCommentByStatus,
  getAllCustomerTasks,
  getCustomersAndTalentsWithoutTasks,
  getCustomerTaskDetails,
  deleteTaskCustomerById
}
