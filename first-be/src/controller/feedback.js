const { createFeedbackRecord,
    updateFeedbackRecord,
    getAllFeedbackRecords,
    checkRecordToken,
    proceedToCreate,
    proceedToResend,
    proceedToOverdue,
    getFeedbackRecordsByTalentId,
} = require('../service/feedbackService');
const {GenericError} = require("../utils/customError");
const { QUESTIONS } = require("../constants/feedback.const");
const {config} = require("../config");
const moment = require("moment");


const createRecord = async (req, res) => {

    const body = req.body;
   try {
       const data = await createFeedbackRecord(body);
       return res.json(data);
   } catch (e) {
       console.error(e);
       return res.status(404).json({message: e.message, name: e.name});
   }
}

const getAllRecords = async (req, res) => {
    const {fromDate, toDate} = req.query;
    const payload = {startDate: fromDate, endDate: toDate};

    try {
        const data = await getAllFeedbackRecords(payload);
        return res.json(data);
    } catch (e) {
        console.error(e);
        return res.status(404).json({message: e.message, name: e.name});
    }
}

const updateRecordWithAnswers = async (req, res) => {
    const body = req.body;
    try {
        if (!body.token) {
            throw new GenericError(400, 'Feedback answers should contain token from email.');
        }

        const isValid = await checkRecordToken(body.token, req.user);

        if (!isValid) {
            throw new GenericError(401, `Cannot answer again on already answered questions`);
        }

        const result = await updateFeedbackRecord(body);

        return res.status(201).json({ result });
    } catch (e) {
        console.error(e);
        return res.status(404).json({message: e.message, name: e.name});
    }
}

const checkToken = async (req, res) => {
    try {
        const {token} = req.body;

        const isValid = await checkRecordToken(token, req.user);

        return res.status(200).json({isValid});
    } catch (e) {
        console.error(e);
        return res.status(e.status || 500).send(e.message)
    }
}

const getQuestions = (req, res) => {
    const questions = QUESTIONS[config.currentFeedbackQuestionsVersion];
    // const questions = QUESTIONS['v1'];
    return res.status(200).json(questions);
}

/* these next three functions are for TEST from POSTMAN ar whatever */
const monday = async (req, res) => {
    try {
        await proceedToCreate();
        return res.send(true)
    } catch (e) {
        console.error(e);
    }
};
const wednesday = async (req, res) => {
    try {
        await proceedToResend();
        return res.send(true)
    } catch (e) {
        console.error(e);
    }
};
const friday = async (req, res) => {
    try {
        await proceedToOverdue();
        return res.send(true)
    } catch (e) {
        console.error(e);
    }
};

const getFeedbackByTalentId = async (req, res) => {
    const { talentId } = req.params;

    // Calculate the start date as one year ago from today
    const startDate = moment.utc().subtract(1, 'year').startOf('day').toDate();
    const endDate = moment.utc().endOf('day').toDate();

    try {
        const data = await getFeedbackRecordsByTalentId(talentId, { startDate, endDate });
        return res.json(data);
    } catch (e) {
        console.error(e);
        return res.status(404).json({ message: e.message, name: e.name });
    }
}


/* === END === these next three functions are for TEST from POSTMAN ar whatever */


module.exports = {
    createRecord,
    getAllRecords,
    updateRecordWithAnswers,
    checkToken,
    getQuestions,
    getFeedbackByTalentId,
    monday,
    wednesday,
    friday
};
