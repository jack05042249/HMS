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

router.get('/', (req, res) => {
    res.send('Yep')
})

// Users
router.get('/getUser',  userCntrl.getUser)
router.post('/login', auth.login);
router.post('/forgotPassword', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.get('/getAuthUser', auth.getAuthUser);

router.post('/signupnewmannager', userCntrl.signup);

router.put('/user', roleCheck, userCntrl.edit)
router.delete('/user/:id', roleCheck, userCntrl.deleteUser)

// Customers
// router.get('/getCustomersWithTalents', customerCntrl.getCustomersWithTalents) // this route is to simulate a cron job
router.get('/customers', roleCheck, customerCntrl.getAllCustomers);
router.post('/customer', roleCheck, customerCntrl.createCustomer);
router.put('/customer', roleCheck, customerCntrl.updateCustomer);
router.delete('/customer/:id',roleCheck,  customerCntrl.deleteCustomer);
router.post('/customer/massEmail', roleCheck, upload.single('img'), customerCntrl.sendMassEmail);

//agency
router.post('/agency', roleCheck, agencyController.create);
router.get('/agency', roleCheck, agencyController.getAll);
router.put('/agency/:id', roleCheck, agencyController.update);
router.delete('/agency/:id', roleCheck, agencyController.deleteOne);

// Feedback
// router.post('/feedback', feedbackController.createRecord);
router.get('/feedback', feedbackController.getAllRecords);
router.get('/feedback/questions', feedbackController.getQuestions);
router.get('/feedback/:talentId', feedbackController.getFeedbackByTalentId);
router.put('/feedback', feedbackController.updateRecordWithAnswers);
router.post('/feedback/checkToken', feedbackController.checkToken);

//Talents
router.get('/allTalents',roleCheck, talentCntr.getAllTalents)
router.get('/getAggregatedTalents',roleCheck, talentCntr.getAggregatedTalents)
router.post('/talent',roleCheck, upload.single('cv'),  talentCntr.createTalent)
router.put('/talent',roleCheck, upload.single('cv'), talentCntr.updateTalent)
router.delete('/talent/:id',roleCheck, talentCntr.deleteTalent)
router.get('/talent/:id/cv', roleCheck, async (req, res) => {
    try {
        const stream = await talentCntr.getTalentCV(req.params.id, res);
        stream.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).send(err.message || 'Server error');
    }
});
router.post('/sendNotificationManually',roleCheck, talentCntr.sendNotificationManually)
router.get('/searchTalent',roleCheck, talentCntr.search)


//Organizations
router.post('/organizations',roleCheck, organizationCntr.createOrganization)
router.put('/organizations',roleCheck, organizationCntr.updateOrganization)
router.get('/organizations',roleCheck, organizationCntr.getAllOrganizations)
router.delete('/organizations/:id',roleCheck, organizationCntr.deleteOrganization)

//Vacations
router.post('/vacation/createRequest', vacationCntrl.createVacationRequest)
router.get('/vacation/requestsList', roleCheck, vacationCntrl.getVacationsForApproval)
router.delete('/vacation/reject/:id', vacationCntrl.rejectVacationById)
router.post('/vacation/approve/:id', roleCheck, vacationCntrl.approveVacationById)
router.get('/vacation/approvedList', vacationCntrl.getApprovedVacations)
router.get('/vacation/balance/:id', vacationCntrl.getRemainedVacationDays)
router.put('/vacation/updateBalance/:id', roleCheck, vacationCntrl.createOrUpdateVacationBalance)
router.get('/vacation/gainedBalance/:id', vacationCntrl.getGainedDays)
router.get('/vacation/usedDays/:id', vacationCntrl.getUsedDays)
router.put('/vacation/updateRequest/:id', roleCheck, vacationCntrl.updateVacationRequestByAdmin)
router.get('/vacation/availableDays/:id', vacationCntrl.getAvailableDays)
router.get('/vacation/fixedBalance/:id', vacationCntrl.getFixedBalanceDays)
router.get('/vacation/history/:id', vacationCntrl.getTalentHistory)
router.get('/vacation/onLeaveToday', vacationCntrl.talentsOnLeaveToday);

//Holidays
router.get('/holidays/birthdays', roleCheck, holidaysCntrl.upcomingBirthdaysGet);
router.get('/holidays/anniversaries', roleCheck, holidaysCntrl.upcomingAnniversariesGet);
router.get('/holidays/upcoming', holidaysCntrl.upcomingHolidays);

// reports
router.get('/reports', roleCheck, reportController.getVacationsReport);
router.get('/common/countries', roleCheck, commonController.getCountries);

//test
// router.post('/feedback/monday', feedbackController.monday);
// router.post('/feedback/wednesday', feedbackController.wednesday);
// router.post('/feedback/friday', feedbackController.friday);

router.get('/reviews/pending', roleCheck, feedbackHrController.getPendingFeedbacksForWeek);
router.post('/reviews/feedback',roleCheck,  feedbackHrController.submitFeedback);
router.get('/reviews/history/:talentId', roleCheck, feedbackHrController.getTalentFeedbackHistoryForTalent);
router.put('/reviews/:feedbackId', roleCheck, feedbackHrController.updateFeedbackById);
router.delete('/reviews/:feedbackId', roleCheck,  feedbackHrController.deleteFeedbackById);

//Talents tasks
router.post('/tasks-employee', roleCheck, tasksEmployeeController.createTaskEmployee);
router.get('/tasks-employee/:talentId', roleCheck, tasksEmployeeController.getTasksForEmployee);
router.get('/tasks-employee/history/:talentId', roleCheck, tasksEmployeeController.getTaskEmployeeHistory);
router.put('/tasks-employee/:taskId', roleCheck, tasksEmployeeController.updateEmployeeCommentByStatus);
router.get('/tasks-employee', roleCheck, tasksEmployeeController.getAllEmployeeTasks);
router.delete('/tasks-talent-remove/:id', roleCheck, tasksEmployeeController.deleteTaskTalentById);


//Customer tasks
router.post('/tasks-customer', roleCheck, tasksCustomerController.createTaskCustomer);
router.get('/tasks-customer/:customerId', roleCheck, tasksCustomerController.getTasksForCustomer);
router.get('/tasks-customer/history/:customerId', roleCheck, tasksCustomerController.getTaskCustomerHistory);
router.put('/tasks-customer/:taskId', roleCheck, tasksCustomerController.updateCustomerCommentByStatus);
router.get('/tasks-customer', roleCheck, tasksCustomerController.getAllCustomerTasks);
router.get('/tasks-report', roleCheck, tasksCustomerController.getCustomersAndTalentsWithoutTasks);
router.get('/tasks-customer-satisfication', roleCheck, tasksCustomerController.getCustomerTaskDetails);
router.get('/tasks-talent-satisfication', roleCheck, tasksEmployeeController.getEmployeeTaskDetails);
router.delete('/tasks-customer-remove/:id', roleCheck, tasksCustomerController.deleteTaskCustomerById);

module.exports = { router };