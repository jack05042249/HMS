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

router.get('/basic-api', (req, res) => {
    res.send('Yep')
})

// Users
router.get('/basic-api/getUser',  userCntrl.getUser)
router.post('/basic-api/login', auth.login);
router.post('/basic-api/forgotPassword', auth.forgotPassword);
router.post('/basic-api/reset-password', auth.resetPassword);
router.get('/basic-api/getAuthUser', auth.getAuthUser);

router.post('/basic-api/signupnewmannager', userCntrl.signup);

router.put('/basic-api/user', roleCheck, userCntrl.edit)
router.delete('/basic-api/user/:id', roleCheck, userCntrl.deleteUser)

// Customers
// router.get('/getCustomersWithTalents', customerCntrl.getCustomersWithTalents) // this route is to simulate a cron job
router.get('/basic-api/customers', roleCheck, customerCntrl.getAllCustomers);
router.post('/basic-api/customer', roleCheck, customerCntrl.createCustomer);
router.put('/basic-api/customer', roleCheck, customerCntrl.updateCustomer);
router.delete('/basic-api/customer/:id',roleCheck,  customerCntrl.deleteCustomer);
router.post('/basic-api/customer/massEmail', roleCheck, upload.single('img'), customerCntrl.sendMassEmail);

//agency
router.post('/basic-api/agency', roleCheck, agencyController.create);
router.get('/basic-api/agency', roleCheck, agencyController.getAll);
router.put('/basic-api/agency/:id', roleCheck, agencyController.update);
router.delete('/basic-api/agency/:id', roleCheck, agencyController.deleteOne);

// Feedback
// router.post('/feedback', feedbackController.createRecord);
router.get('/basic-api/feedback', feedbackController.getAllRecords);
router.get('/basic-api/feedback/questions', feedbackController.getQuestions);
router.get('/basic-api/feedback/:talentId', feedbackController.getFeedbackByTalentId);
router.put('/basic-api/feedback', feedbackController.updateRecordWithAnswers);
router.post('/basic-api/feedback/checkToken', feedbackController.checkToken);

//Talents
router.get('/basic-api/allTalents',roleCheck, talentCntr.getAllTalents)
router.get('/basic-api/getAggregatedTalents',roleCheck, talentCntr.getAggregatedTalents)
router.post('/basic-api/talent',roleCheck, upload.single('cv'),  talentCntr.createTalent)
router.put('/basic-api/talent',roleCheck, upload.single('cv'), talentCntr.updateTalent)
router.delete('/basic-api/talent/:id',roleCheck, talentCntr.deleteTalent)
router.get('/basic-api/talent/:id/cv', roleCheck, async (req, res) => {
    try {
        const stream = await talentCntr.getTalentCV(req.params.id, res);
        stream.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).send(err.message || 'Server error');
    }
});
router.post('/basic-api/sendNotificationManually',roleCheck, talentCntr.sendNotificationManually)
router.get('/basic-api/searchTalent',roleCheck, talentCntr.search)


//Organizations
router.post('/basic-api/organizations',roleCheck, organizationCntr.createOrganization)
router.put('/basic-api/organizations',roleCheck, organizationCntr.updateOrganization)
router.get('/basic-api/organizations',roleCheck, organizationCntr.getAllOrganizations)
router.delete('/basic-api/organizations/:id',roleCheck, organizationCntr.deleteOrganization)

//Vacations
router.post('/basic-api/vacation/createRequest', vacationCntrl.createVacationRequest)
router.get('/basic-api/vacation/requestsList', roleCheck, vacationCntrl.getVacationsForApproval)
router.delete('/basic-api/vacation/reject/:id', vacationCntrl.rejectVacationById)
router.post('/basic-api/vacation/approve/:id', roleCheck, vacationCntrl.approveVacationById)
router.get('/basic-api/vacation/approvedList', vacationCntrl.getApprovedVacations)
router.get('/basic-api/vacation/balance/:id', vacationCntrl.getRemainedVacationDays)
router.put('/basic-api/vacation/updateBalance/:id', roleCheck, vacationCntrl.createOrUpdateVacationBalance)
router.get('/basic-api/vacation/gainedBalance/:id', vacationCntrl.getGainedDays)
router.get('/basic-api/vacation/usedDays/:id', vacationCntrl.getUsedDays)
router.put('/basic-api/vacation/updateRequest/:id', roleCheck, vacationCntrl.updateVacationRequestByAdmin)
router.get('/basic-api/vacation/availableDays/:id', vacationCntrl.getAvailableDays)
router.get('/basic-api/vacation/fixedBalance/:id', vacationCntrl.getFixedBalanceDays)
router.get('/basic-api/vacation/history/:id', vacationCntrl.getTalentHistory)
router.get('/basic-api/vacation/onLeaveToday', vacationCntrl.talentsOnLeaveToday);

//Holidays
router.get('/basic-api/holidays/birthdays', roleCheck, holidaysCntrl.upcomingBirthdaysGet);
router.get('/basic-api/holidays/anniversaries', roleCheck, holidaysCntrl.upcomingAnniversariesGet);
router.get('/basic-api/holidays/upcoming', holidaysCntrl.upcomingHolidays);

// reports
router.get('/basic-api/reports', roleCheck, reportController.getVacationsReport);
router.get('/basic-api/common/countries', roleCheck, commonController.getCountries);

//test
// router.post('/feedback/monday', feedbackController.monday);
// router.post('/feedback/wednesday', feedbackController.wednesday);
// router.post('/feedback/friday', feedbackController.friday);

router.get('/basic-api/reviews/pending', roleCheck, feedbackHrController.getPendingFeedbacksForWeek);
router.post('/basic-api/reviews/feedback',roleCheck,  feedbackHrController.submitFeedback);
router.get('/basic-api/reviews/history/:talentId', roleCheck, feedbackHrController.getTalentFeedbackHistoryForTalent);
router.put('/basic-api/reviews/:feedbackId', roleCheck, feedbackHrController.updateFeedbackById);
router.delete('/basic-api/reviews/:feedbackId', roleCheck,  feedbackHrController.deleteFeedbackById);

//Talents tasks
router.post('/basic-api/tasks-employee', roleCheck, tasksEmployeeController.createTaskEmployee);
router.get('/basic-api/tasks-employee/:talentId', roleCheck, tasksEmployeeController.getTasksForEmployee);
router.get('/basic-api/tasks-employee/history/:talentId', roleCheck, tasksEmployeeController.getTaskEmployeeHistory);
router.put('/basic-api/tasks-employee/:taskId', roleCheck, tasksEmployeeController.updateEmployeeCommentByStatus);
router.get('/basic-api/tasks-employee', roleCheck, tasksEmployeeController.getAllEmployeeTasks);
router.delete('/basic-api/tasks-talent-remove/:id', roleCheck, tasksEmployeeController.deleteTaskTalentById);


//Customer tasks
router.post('/basic-api/tasks-customer', roleCheck, tasksCustomerController.createTaskCustomer);
router.get('/basic-api/tasks-customer/:customerId', roleCheck, tasksCustomerController.getTasksForCustomer);
router.get('/basic-api/tasks-customer/history/:customerId', roleCheck, tasksCustomerController.getTaskCustomerHistory);
router.put('/basic-api/tasks-customer/:taskId', roleCheck, tasksCustomerController.updateCustomerCommentByStatus);
router.get('/basic-api/tasks-customer', roleCheck, tasksCustomerController.getAllCustomerTasks);
router.get('/basic-api/tasks-report', roleCheck, tasksCustomerController.getCustomersAndTalentsWithoutTasks);
router.get('/basic-api/tasks-customer-satisfication', roleCheck, tasksCustomerController.getCustomerTaskDetails);
router.get('/basic-api/tasks-talent-satisfication', roleCheck, tasksEmployeeController.getEmployeeTaskDetails);
router.delete('/basic-api/tasks-customer-remove/:id', roleCheck, tasksCustomerController.deleteTaskCustomerById);

module.exports = { router };