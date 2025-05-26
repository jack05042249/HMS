const express = require('express')
const router = express.Router()
const userCntrl = require('./controller/users')
const customerCntrl = require('./controller/customers')
const talentCntr = require('./controller/talents')
const vacationCntrl = require('./controller/vacation')
const organizationCntr = require('./controller/organizations')
const upload = require('./utils/multerConfig')
const auth = require('./controller/auth')
const { roleCheck } = require('./middleware/roleCheck')
const holidaysCntrl = require('./controller/holidays')
const agencyController = require('./controller/agency');
const feedbackController = require('./controller/feedback');
const reportController = require('./controller/report');
const commonController = require('./controller/common');
const feedbackHrController = require('./controller/hrFeedback');
const tasksEmployeeController = require('./controller/tasksEmployee');
const tasksCustomerController = require('./controller/tasksCustomer');

router.get('/api/', (req, res) => {
    res.send('Yep')
})

// Users
router.get('/api/getUser',  userCntrl.getUser)
router.post('/api/login', auth.login);
router.get('/api/getAuthUser', auth.getAuthUser);

router.post('/api/signupnewmannager', userCntrl.signup);

router.put('/api/user', roleCheck, userCntrl.edit)
router.delete('/api/user/:id', roleCheck, userCntrl.deleteUser)

// Customers
// router.get('/getCustomersWithTalents', customerCntrl.getCustomersWithTalents) // this route is to simulate a cron job
router.get('/api/customers', roleCheck, customerCntrl.getAllCustomers);
router.post('/api/customer', roleCheck, customerCntrl.createCustomer);
router.put('/api/customer', roleCheck, customerCntrl.updateCustomer);
router.delete('/api/customer/:id',roleCheck,  customerCntrl.deleteCustomer);
router.post('/api/customer/massEmail', roleCheck, upload.single('img'), customerCntrl.sendMassEmail);

//agency
router.post('/api/agency', roleCheck, agencyController.create);
router.get('/api/agency', roleCheck, agencyController.getAll);
router.put('/api/agency/:id', roleCheck, agencyController.update);
router.delete('/api/agency/:id', roleCheck, agencyController.deleteOne);

// Feedback
// router.post('/feedback', feedbackController.createRecord);
router.get('/api/feedback', feedbackController.getAllRecords);
router.get('/api/feedback/questions', feedbackController.getQuestions);
router.get('/api/feedback/:talentId', feedbackController.getFeedbackByTalentId);
router.put('/api/feedback', feedbackController.updateRecordWithAnswers);
router.post('/api/feedback/checkToken', feedbackController.checkToken);

//Talents
router.get('/api/allTalents',roleCheck, talentCntr.getAllTalents)
router.get('/api/getAggregatedTalents',roleCheck, talentCntr.getAggregatedTalents)
router.post('/api/talent',roleCheck, upload.single('cv'),  talentCntr.createTalent)
router.put('/api/talent',roleCheck, upload.single('cv'), talentCntr.updateTalent)
router.delete('/api/talent/:id',roleCheck, talentCntr.deleteTalent)
router.get('/api/talent/:id/cv', roleCheck, async (req, res) => {
    try {
        const stream = await talentCntr.getTalentCV(req.params.id, res);
        stream.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).send(err.message || 'Server error');
    }
});
router.post('/api/sendNotificationManually',roleCheck, talentCntr.sendNotificationManually)
router.get('/api/searchTalent',roleCheck, talentCntr.search)


//Organizations
router.post('/api/organizations',roleCheck, organizationCntr.createOrganization)
router.put('/api/organizations',roleCheck, organizationCntr.updateOrganization)
router.get('/api/organizations',roleCheck, organizationCntr.getAllOrganizations)
router.delete('/api/organizations/:id',roleCheck, organizationCntr.deleteOrganization)

//Vacations
router.post('/api/vacation/createRequest', vacationCntrl.createVacationRequest)
router.get('/api/vacation/requestsList', roleCheck, vacationCntrl.getVacationsForApproval)
router.delete('/api/vacation/reject/:id', vacationCntrl.rejectVacationById)
router.post('/api/vacation/approve/:id', roleCheck, vacationCntrl.approveVacationById)
router.get('/api/vacation/approvedList', vacationCntrl.getApprovedVacations)
router.get('/api/vacation/balance/:id', vacationCntrl.getRemainedVacationDays)
router.put('/api/vacation/updateBalance/:id', roleCheck, vacationCntrl.createOrUpdateVacationBalance)
router.get('/api/vacation/gainedBalance/:id', vacationCntrl.getGainedDays)
router.get('/api/vacation/usedDays/:id', vacationCntrl.getUsedDays)
router.put('/api/vacation/updateRequest/:id', roleCheck, vacationCntrl.updateVacationRequestByAdmin)
router.get('/api/vacation/availableDays/:id', vacationCntrl.getAvailableDays)
router.get('/api/vacation/fixedBalance/:id', vacationCntrl.getFixedBalanceDays)
router.get('/api/vacation/history/:id', vacationCntrl.getTalentHistory)
router.get('/api/vacation/onLeaveToday', vacationCntrl.talentsOnLeaveToday);

//Holidays
router.get('/api/holidays/birthdays', roleCheck, holidaysCntrl.upcomingBirthdaysGet);
router.get('/api/holidays/anniversaries', roleCheck, holidaysCntrl.upcomingAnniversariesGet);
router.get('/api/holidays/upcoming', holidaysCntrl.upcomingHolidays);

// reports
router.get('/api/reports', roleCheck, reportController.getVacationsReport);
router.get('/api/common/countries', roleCheck, commonController.getCountries);

//test
// router.post('/api/feedback/monday', feedbackController.monday);
// router.post('/api/feedback/wednesday', feedbackController.wednesday);
// router.post('/api/feedback/friday', feedbackController.friday);

router.get('/api/reviews/pending', roleCheck, feedbackHrController.getPendingFeedbacksForWeek);
router.post('/api/reviews/feedback',roleCheck,  feedbackHrController.submitFeedback);
router.get('/api/reviews/history/:talentId', roleCheck, feedbackHrController.getTalentFeedbackHistoryForTalent);
router.put('/api/reviews/:feedbackId', roleCheck, feedbackHrController.updateFeedbackById);
router.delete('/api/reviews/:feedbackId', roleCheck,  feedbackHrController.deleteFeedbackById);

//Talents tasks
router.post('/api/tasks-employee', roleCheck, tasksEmployeeController.createTaskEmployee);
router.get('/api/tasks-employee/:talentId', roleCheck, tasksEmployeeController.getTasksForEmployee);
router.get('/api/tasks-employee/history/:talentId', roleCheck, tasksEmployeeController.getTaskEmployeeHistory);
router.put('/api/tasks-employee/:taskId', roleCheck, tasksEmployeeController.updateEmployeeCommentByStatus);
router.get('/api/tasks-employee', roleCheck, tasksEmployeeController.getAllEmployeeTasks);
router.delete('/api/tasks-talent-remove/:id', roleCheck, tasksEmployeeController.deleteTaskTalentById);


//Customer tasks
router.post('/api/tasks-customer', roleCheck, tasksCustomerController.createTaskCustomer);
router.get('/api/tasks-customer/:customerId', roleCheck, tasksCustomerController.getTasksForCustomer);
router.get('/api/tasks-customer/history/:customerId', roleCheck, tasksCustomerController.getTaskCustomerHistory);
router.put('/api/tasks-customer/:taskId', roleCheck, tasksCustomerController.updateCustomerCommentByStatus);
router.get('/api/tasks-customer', roleCheck, tasksCustomerController.getAllCustomerTasks);
router.get('/api/tasks-report', roleCheck, tasksCustomerController.getCustomersAndTalentsWithoutTasks);
router.get('/api/tasks-customer-satisfication', roleCheck, tasksCustomerController.getCustomerTaskDetails);
router.get('/api/tasks-talent-satisfication', roleCheck, tasksEmployeeController.getEmployeeTaskDetails);
router.delete('/api/tasks-customer-remove/:id', roleCheck, tasksCustomerController.deleteTaskCustomerById);

module.exports = { router };