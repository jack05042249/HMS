const express = require('express')
const basic_router = express.Router()
const tasksEmployeeController = require('./controller/tasksEmployee');
const tasksCustomerController = require('./controller/tasksCustomer');

basic_router.get('/', (req, res) => {
    res.send('Yep')
})

basic_router.get('/active-tasks', async (req, res) => {
    try {
        const [tasksCustomer, tasksEmployee] = await Promise.all([
            tasksCustomerController.getAllActiveTasks(),
            tasksEmployeeController.getAllActiveTasks()
        ]);
        res.json({ tasksCustomer, tasksEmployee });
    } catch (error) {
        console.error('Error fetching active tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = { basic_router };