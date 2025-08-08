const tasksCustomerService = require('../service/tasksCustomer');

// Create a new task for a customer
const createTaskCustomer = async (req, res) => {
  try {
    const task = await tasksCustomerService.createTaskCustomer(req.body);
    res.status(201).json({ message: 'Task created successfully.', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks for a customer with optional filtering and sorting
const getTasksForCustomer = async (req, res) => {
  const { customerId } = req.params;
  const { sortBy = 'dueDate', sortOrder = 'ASC' } = req.query;

  try {
    const tasks = await tasksCustomerService.getTasksForCustomer({
      customerId,
      sortBy,
      sortOrder,
      status: req.query?.status,
      risk: req.query?.risk,
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get task history for a customer
const getTaskCustomerHistory = async (req, res) => {
  const { customerId } = req.params;

  try {
    const tasks = await tasksCustomerService.getTaskCustomerHistory(customerId);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTaskCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await tasksCustomerService.deleteTaskCustomerById(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update task's comment and/or status for a customer
const updateCustomerCommentByStatus = async (req, res) => {
  const { taskId } = req.params;
  const { comment, status, risk, dueDate } = req.body;

  try {
    const task = await tasksCustomerService.updateCustomerCommentByStatus(taskId, { comment, status, risk, dueDate });
    res.status(200).json({ message: 'Task updated successfully.', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks for customers with optional filters
const getAllCustomerTasks = async (req, res) => {
  try {
    const tasks = await tasksCustomerService.getAllCustomerTasks({
      sortOrder: req.query?.sortOrder,
      status: req.query?.status,
      risk: req.query?.risk,
      startDate: req.query?.startDate,
      endDate: req.query?.endDate,
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all tasks for customers with optional filters
const getAllActiveTasks = async () => {
  try {
    const tasks = await tasksCustomerService.getAllCustomerTasks({
      sortOrder: '',
      status: 'OPEN',
      risk: '',
      startDate: '',
      endDate: '',
    });
    return tasks;
  } catch (error) {
    throw new Error('Error fetching active tasks');
  }
};

const getCustomersAndTalentsWithoutTasks = async (req, res) => {
  try {
    const tasks = await tasksCustomerService.getCustomersAndTalentsWithoutTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerTaskDetails = async (req, res) => {
  try {
    const tasks = await tasksCustomerService.getCustomerTaskDetails();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTaskCustomer,
  getTasksForCustomer,
  getTaskCustomerHistory,
  updateCustomerCommentByStatus,
  getAllCustomerTasks,
  getCustomersAndTalentsWithoutTasks,
  getCustomerTaskDetails,
  deleteTaskCustomerById,
  getAllActiveTasks
};
