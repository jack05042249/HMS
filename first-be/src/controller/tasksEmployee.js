const tasksEmployeeService = require('../service/tasksEmployee');
const tasksCustomerService = require('../service/tasksCustomer')

// Create a new task for an employee
const createTaskEmployee = async (req, res) => {
  try {
    const task = await tasksEmployeeService.createTaskEmployee(req.body);
    res.status(201).json({ message: 'Task created successfully.', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks for an employee with optional filtering and sorting
const getTasksForEmployee = async (req, res) => {
  const { talentId } = req.params;
  const { sortBy = 'dueDate', sortOrder = 'ASC' } = req.query;

  try {
    const tasks = await tasksEmployeeService.getTasksForEmployee({
      talentId,
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

// Get task history for an employee
const getTaskEmployeeHistory = async (req, res) => {
  const { talentId } = req.params;

  try {
    const tasks = await tasksEmployeeService.getTaskEmployeeHistory(talentId);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTaskTalentById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await tasksEmployeeService.deleteTaskTalentById(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task's comment and/or status for an employee
const updateEmployeeCommentByStatus = async (req, res) => {
  const { taskId } = req.params;
  const { comment, status, risk, dueDate } = req.body;

  try {
    const task = await tasksEmployeeService.updateEmployeeCommentByStatus(taskId, { comment, status, risk, dueDate });
    res.status(200).json({ message: 'Task updated successfully.', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks for employees with optional filters
const getAllEmployeeTasks = async (req, res) => {
  try {
    const tasks = await tasksEmployeeService.getAllEmployeeTasks({
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

const getAllActiveTasks = async () => {
  try {
    const tasks = await tasksEmployeeService.getAllEmployeeTasks({
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

const getEmployeeTaskDetails = async (req, res) => {
  try {
    const tasks = await tasksEmployeeService.getEmployeeTaskDetails();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTaskEmployee,
  getTasksForEmployee,
  getTaskEmployeeHistory,
  updateEmployeeCommentByStatus,
  getAllEmployeeTasks,
  getEmployeeTaskDetails,
  deleteTaskTalentById,
  getAllActiveTasks
};
