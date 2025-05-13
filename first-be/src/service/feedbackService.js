const {Feedbacks, Talent, Agencies} = require('../models');
const {
    FEEDBACK_STATUS,
    FREQUENCIES,
    FEEDBACK_ACTIONS,
    QUESTIONS
} = require('../constants/feedback.const');
const {GenericError} = require('../utils/customError');
const moment = require("moment");
const {Op} = require('sequelize');
const {createToken, verifyToken} = require('./jwt');
const {config} = require('../config');
const {sendFeedbackEmail} = require('./emailService');
const {logger} = require('../utils/logger');
const {getOnLeaveTalentsToday} = require('./vacationService');
const _ = require('lodash');
const { getFirstObjectKey } = require('../utils/util');

moment.locale('en', {
    week: {
        dow: 1 // Set Monday as the start of the week (0: Sunday, 1: Monday, ..., 6: Saturday)
    }
});

const DURATION_TYPES = Object.freeze({
    MONTHS: 'months',
    WEEKS: 'weeks'
})

const createFeedbackRecord = ({id}) => {
    const payload = {
        talentId: id,
        status: FEEDBACK_STATUS.SENT
    };

    return Feedbacks.create(payload);
};

const checkRecordToken = async (token, talent) => {
    return await checkToken(token, talent);
}

const getAllFeedbackRecords = async ({startDate, endDate}) => {

    startDate = moment.utc(startDate).startOf('day').toDate();
    endDate = moment.utc(endDate).endOf('day').toDate();

    const records =  await Feedbacks.findAll({
        where: {
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        attributes: ['id', 'status', 'answers', 'createdAt'],
        include: [
            {
                model: Talent,
                as: 'talent',
                attributes: ['id', 'fullName', 'projectName'],
                include: [
                    {
                        model: Agencies,
                        as: 'agency',
                        attributes: ['id', 'name']
                    }
                ]
            }
        ]
    });

    return records.map(r => {
        const {answers, ...data} = r.toJSON();

        const mappedAnswersAndQuestions = getAnswers(answers);

        return {
            ...data,
            ...mappedAnswersAndQuestions
        }
    })
}


function getAnswers(answers) {
    const parsedAnswers = JSON.parse(answers);
    const version = getFirstObjectKey(parsedAnswers);

    switch (version) {
        case 'v1': {
            return {
                version: 'v1',
                data: V1_answersMapper(parsedAnswers)
            };
        }
        case 'v2': {
            return {
                version: 'v2',
                data: V2_answersMapper(parsedAnswers)
            };
        }
        default:
            return null;
    }
}

function V1_answersMapper(answers) {
    const questions = QUESTIONS['v1'];
    const mapped = [];

    for (const questionIndex in questions) {
        const question = questions[questionIndex];
        mapped.push({
            question: question,
            answer: answers['v1'][questionIndex]
        })
    }
    return mapped;
}
function V2_answersMapper(answers) {
    const questions= QUESTIONS['v2'];
    const mapped = [];

   for (const sectionKey in questions) {
       const section = QUESTIONS['v2'][sectionKey];
       const questionList = section.questions;

       const payload = {
           title: section.title,
           answers: []
       }

        for (const questionIndex in questionList) {
            const question = questionList[questionIndex];
            payload.answers.push({
                question: question.question,
                answer: answers['v2'][sectionKey][questionIndex]
            })
        }
        mapped.push(payload);
   }
   return mapped

}

const updateFeedbackRecord = async (payload) => {
    const {talentId, recordId} = await verifyToken(payload.token);

    const toUpdatePayload = {
        status: FEEDBACK_STATUS.ANSWERED,
        answers: JSON.stringify({
            [config.currentFeedbackQuestionsVersion]: payload.answers
        })
    };

    const isUpdate = await Feedbacks.update(toUpdatePayload, {
        where: {id: recordId},
    });
    if (!!isUpdate[0]) {
        return true;
    }

    throw new GenericError(400, 'Cannot update please Feedbacks[record] debug app!')
}

const getFeedbackRecordsByTalentId = async (talentId, { startDate, endDate }) => {
    const records = await Feedbacks.findAll({
        where: {
            talentId,  // Filter by talentId
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        attributes: ['id', 'talentId', 'status', 'answers', 'createdAt', 'updatedAt']
    });

    console.log(records)

    return records.map(r => {
        const { answers, ...data } = r.toJSON();

        const mappedAnswersAndQuestions = getAnswers(answers);

        return {
            ...data,
            ...mappedAnswersAndQuestions
        }
    });
}



module.exports = {
    createFeedbackRecord,
    updateFeedbackRecord,
    getAllFeedbackRecords,
    checkRecordToken,
    getFeedbackRecordsByTalentId,
    proceedToCreate,
    proceedToResend,
    proceedToOverdue
}


async function createNewFeedbackForTalent({talent}) {
    const record = await createFeedbackRecord(talent);
    const token = createUniqueFeedbackToken(talent.id, record.id);

    const authToken = loginTargetTalent(talent.id);

    const link = createLink(token, authToken);

    await sendFeedbackEmail(talent, link, FEEDBACK_STATUS.SENT);
    console.log('First email sent. Link: ' + link);
}

async function reSendFeedbackForTalent({talent, record}) {
    const updated = await Feedbacks.update({
        status: FEEDBACK_STATUS.RESENT
    }, {where: {id: record.id}});

    const token = createUniqueFeedbackToken(talent.id, record.id);

    const authToken = loginTargetTalent(talent.id);

    const link = createLink(token, authToken);

    await sendFeedbackEmail(talent, link, FEEDBACK_STATUS.RESENT);
    console.log('Second email sent. Link: ' + link);
}

async function updateFeedbackOverdue({talent, record}) {
    await Feedbacks.update({
        status: FEEDBACK_STATUS.OVERDUE
    }, {where: {id: record.id}});
}

async function proceedToCreate() {
    logger('Monday FEEDBACK Create.');
    const talents = await Talent.findAll(whereClauseForRecords());
    const {toCreate} = proceedTalents(talents, FEEDBACK_ACTIONS.TO_CREATE);

    const allowedToCreate = await checkTalentsVacation(toCreate);

    if (allowedToCreate.length) {
        logger(`[Monday to CREATE Feedback]`, toCreate);
    }

    for (const payload of allowedToCreate) {
        await createNewFeedbackForTalent(payload);
    }
}

async function proceedToResend() {
    logger('Wednesday FEEDBACK resend CHECK.');

    const talents = await Talent.findAll(whereClauseForRecords());
    const {toResend} = proceedTalents(talents, FEEDBACK_ACTIONS.TO_RESEND);

    const allowedToResend = await checkTalentsVacation(toResend);

    if (allowedToResend.length) {
        logger(`[Wednesday to RESEND Feedback]`, toResend);
    }

    for (const payload of allowedToResend) {
        await reSendFeedbackForTalent(payload);
    }
}

async function proceedToOverdue() {
    logger('Friday FEEDBACK CHECK.');
    const talents = await Talent.findAll(whereClauseForRecords());
    const {toOverdue} = proceedTalents(talents, FEEDBACK_ACTIONS.TO_OVERDUE);

    if (toOverdue.length) {
        logger(`[Friday to OVERDUE Feedback]`, toOverdue);
    }

    for (const payload of toOverdue) {
        await updateFeedbackOverdue(payload);
    }
}

async function checkTalentsVacation(proceedPayloads) {
    const talentIds = proceedPayloads.map(({talent}) => talent.id);

    const talentsTodayVacationRecords = await getOnLeaveTalentsToday(talentIds); //
    const onVacationTodayIds = talentsTodayVacationRecords.map(record => record.talent.id);

    return proceedPayloads.filter(({talent}) => !onVacationTodayIds.includes(talent.id));
}

function createUniqueFeedbackToken(talentId, recordId) {
    const tokenPayload = {talentId, recordId};
    return createToken(tokenPayload)
}

async function checkToken(token, talent) {
    const payload = await verifyToken(token); // decode token

    if (payload.talentId !== talent.id) { // check if talent open his own email
        return false;
    }

    const currentRecord = await isFeedbackLastCreated(payload);

    const {status} = currentRecord;

    return (!(status === FEEDBACK_STATUS.ANSWERED || status === FEEDBACK_STATUS.OVERDUE))
}

async function isFeedbackLastCreated({talentId, recordId}) {
    return await Feedbacks.findOne({
        where: {id: recordId, talentId},
        attributes: ['id', 'createdAt', 'status'],
        raw: true
    })
}

/*
1. check frequency and send new email with new token
2. in 2 days check if record was updated - if not mark as checked and not answered
3. in 2 days after 2 days check if was answered if not mark as determinate, destroy link token
 */
function proceedTalents(talents, scenario) {
    const data = {
        [FEEDBACK_ACTIONS.TO_RESEND]: [],
        [FEEDBACK_ACTIONS.TO_OVERDUE]: [],
        [FEEDBACK_ACTIONS.TO_CREATE]: []
    };

    for (const talent of talents) {
        // console.log(talent.id);
        const currentTalentFrequency = talent.feedbackFrequency;

        const sortedByCreatedAt = sortFeedbacksByDate(talent.feedbacks); // to get the last one

        const lastSent = sortedByCreatedAt[sortedByCreatedAt.length - 1];

        const payload = {
            talent,
            record: lastSent
        }
        if (lastSent) {
            const ACTION = checkFeedbackRecordDaysDifference(lastSent, currentTalentFrequency, scenario);

            switch (ACTION) {
                case FEEDBACK_ACTIONS.TO_RESEND: {
                    data[FEEDBACK_ACTIONS.TO_RESEND].push(payload);
                    break;
                }

                case FEEDBACK_ACTIONS.TO_OVERDUE: {
                    data[FEEDBACK_ACTIONS.TO_OVERDUE].push(payload);
                    break;
                }

                case FEEDBACK_ACTIONS.TO_CREATE: {
                    data[FEEDBACK_ACTIONS.TO_CREATE].push(payload);
                    break;
                }
            }
        } else {
            data[FEEDBACK_ACTIONS.TO_CREATE].push(payload);
        }
    }

    return data;
}

/*
    @return ACTION
 */
function checkFeedbackRecordDaysDifference(feedback, frequency, scenario) { //
    // const today = moment();
    const today = moment();

    const createdAt = moment(feedback.createdAt);
    const STATUS = feedback.status;

    switch (scenario) {
        // work only on Mondays
        case FEEDBACK_ACTIONS.TO_CREATE: {
            if (isExactlyDifferenceWith(feedback, frequency)) {
                // just create new one and return if date creation has difference (frequency)
                return FEEDBACK_ACTIONS.TO_CREATE;
            }
            break;
        }

        // work only on Wednesdays
        case FEEDBACK_ACTIONS.TO_RESEND: {
            const isFeedbackCreatedThisMonday = createdAt.isSame(today.clone().startOf('week'), 'day');
            const isWednesday = today.day() === 3;

            if (isWednesday && isFeedbackCreatedThisMonday && STATUS === FEEDBACK_STATUS.SENT) {
                return FEEDBACK_ACTIONS.TO_RESEND;
            }
            break;
        }

        // work only on Fridays
        case FEEDBACK_ACTIONS.TO_OVERDUE: {
            const isFeedbackCreatedThisMonday = createdAt.isSame(today.clone().startOf('week'), 'day');
            const isFriday = today.day() === 5;

            if (isFriday && isFeedbackCreatedThisMonday && STATUS === FEEDBACK_STATUS.RESENT) { // should be Friday
                return FEEDBACK_ACTIONS.TO_OVERDUE;
            }
            break;
        }
    }

    // console.log(`Talent ID ${feedback.talentId} can answer.`);
    return null;
}

function sortFeedbacksByDate(feedbacks, ascending = true) { // the last in array will be the last created
    return feedbacks.map(a => a.toJSON()).sort((a, b) => {
        const aCreated = moment(a.createdAt).valueOf();
        const bCreated = moment(b.createdAt).valueOf();
        return ascending ? aCreated - bCreated : bCreated - aCreated;
    })
}

function isExactlyDifferenceWith(feedback, frequency) {
    const today = moment();
    const createdAt = moment(feedback.createdAt);

    switch (frequency) {
        case FREQUENCIES.ONCE_WEEK: {
            // return today.diff(createdAt, 'days') === 7;
            return isDurationDifference(createdAt, today, DURATION_TYPES.WEEKS, 1);
        }
        case FREQUENCIES.TWICE_WEEK: {
            return isDurationDifference(createdAt, today, DURATION_TYPES.WEEKS, 2);
        }
        case FREQUENCIES.ONCE_MONTH: {
            return isDurationDifference(createdAt, today, DURATION_TYPES.MONTHS, 1);
        }
    }
    return false;
}

function whereClauseForRecords() {
    return {
        where: {
            feedbackFrequency: {
                [Op.not]: null
            }
        },
        attributes: ['id', 'fullName', 'feedbackFrequency', 'email'],
        include: [{
            model: Feedbacks,
            as: 'feedbacks',
            attributes: ['status', 'talentId', 'createdAt', 'answers', 'id'],
        }],
    }
}

function createLink(token, authToken) {
    return `${config.appUrl}/talent/feedback?token=${token}&auth=${authToken}`;
}

function loginTargetTalent(talentId) {
    return createToken({ id: talentId, type: 'talent' });
}

function isDurationDifference(date1, date2, unitType = DURATION_TYPES.WEEKS, rangeAmount = 1) {
    const duration = moment.duration(moment(date2).diff(moment(date1)));

    switch (unitType) {
        case DURATION_TYPES.WEEKS: {
            const diffAmount = duration.asWeeks();
            return Math.abs(Math.floor(diffAmount)) === rangeAmount;
        }
        case DURATION_TYPES.MONTHS: {
            const diffAmount = duration.asMonths();
            return Math.abs(Math.floor(diffAmount)) === rangeAmount;
        }
    }
}
