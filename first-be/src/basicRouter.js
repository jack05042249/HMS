const express = require('express')
const basic_router = express.Router()
const tasksEmployeeController = require('./controller/tasksEmployee');
const tasksCustomerController = require('./controller/tasksCustomer');
const talentsController = require('./controller/talents');
const customersController = require('./controller/customers');
const organizationsController = require('./controller/organizations');
const moment = require('moment');

basic_router.get('/', (req, res) => {
    res.send('Yep')
})

basic_router.get('/active-tasks', async (req, res) => {
    try {
        const [tasksCustomer, tasksEmployee] = await Promise.all([
            tasksCustomerController.getAllActiveTasks(),
            tasksEmployeeController.getAllActiveTasks()
        ]);

        const [Talents, Customers, Organizations] = await Promise.all([
            talentsController.getAllTalents2(),
            customersController.getAllCustomers2(),
            organizationsController.getAllOrganizations2()
        ]);

        const getRelevantTalent = (id) => Talents.find(talent => talent.id === id);
        const getRelevantCustomer = (id) => Customers.find(customer => customer.id === id)?.dataValues;
        const getOrganizationName = (id) => Organizations.find(organization => organization.id === id)?.name || '';

        const processedEmployeeTasks = tasksEmployee.map(task => ({
          ...task.dataValues,
          type: 'employee'
        }));
        const processedCustomerTasks = tasksCustomer.map(task => ({
          ...task.dataValues,
          type: 'customer'
        }));

        const mergedTasks = [...processedEmployeeTasks, ...processedCustomerTasks];

        let processedTasks = [];

        for (const task of mergedTasks) {
            const object = 
              (task.type === 'employee' ?  getRelevantTalent(task.talentId) : getRelevantCustomer(task.customerId)) ||
              {};

            if (object == {}) continue;

            processedTasks.push({
                Type: task.type,
                Name: object.fullName || '',
                Customer: task.type === 'employee' ? object.talentMainCustomer ? getOrganizationName(getRelevantCustomer(object.talentMainCustomer).organizationId) : '' : getOrganizationName(object.organizationId),
                Agency: task.type === 'employee' ? object.agencyName : '',
                Notes: task.comment || '',
                Status: task.status,
                Risk: task.risk,
                DueDate: task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : '-',
            });
        }
        res.json(processedTasks);
    } catch (error) {
        console.error('Error fetching active tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = { basic_router };