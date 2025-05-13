const { GenericError } = require("../utils/customError");
const { createVacation, getExpectVacations, approveVacation, approvedVacations, rejectVacation, changeVacationBalance, getVacationById, updateVacationBalance, getVacationBalanceByTalentId, calculateVacationDays,
  getTalentRemainedBalanceValues,
  getTalentFixedBalancesValues,
  isOneMonthPlanningLimit,
  calculateGainedDays,
  getTalentAllUsedDays,
  getTalentAvailableDaysAllTypes,
  talentVacationHistory,
  getOnLeaveTalentsToday,
  isTalentHaveUniqueBalanceValues,
  getRequestById,
  updateVacationRequest,
  daysRangeChecker
} = require('../service/vacationService');
const {getTalentById} = require('../service/talentsService');
const moment = require('moment');
const _ = require('lodash');

const createVacationRequest = async (req, res) => {
  try {
    const { ...vacationData } = req.body;
    const talentId = req.body.talentId;

    if (!vacationData.startDate || !vacationData.endDate || !vacationData.type) {
      throw new GenericError(400, 'StartDate, EndDate, and Type are required');
    }

    const startDateMoment = moment(vacationData.startDate);
    const endDateMoment = moment(vacationData.endDate);

    if (endDateMoment.isBefore(startDateMoment)) {
      throw new GenericError(400, 'EndDate cannot be before StartDate');
    }

    const isCrossingIntoJanuary =
      startDateMoment.month() === 11 &&
      endDateMoment.month() === 0 &&
      endDateMoment.year() === startDateMoment.year() + 1 &&
      vacationData.type === 'vacation';

    if (isCrossingIntoJanuary) {
      vacationData.endDate = startDateMoment.endOf('year').format('YYYY-MM-DD');
    }

    if (vacationData.type === "vacation") {
      if (!daysRangeChecker(vacationData.startDate, vacationData.endDate)) {
        throw new GenericError(400, 'Max period of paid vacation is 10 days');
      }
    }

    const talent = await getTalentById(talentId);

    if (talent.startDate <= vacationData.startDate) {
      throw new GenericError(400, 'This talent has not yet earned enough vacation days');
    }

    const daysCalculator = await calculateVacationDays(talentId, vacationData);

    if (!daysCalculator) {
      throw new GenericError(400, 'You don’t have enough gained days for this type of vacation');
    }

    const createdVacation = await createVacation(talentId, vacationData);
    return res.status(201).json(createdVacation);
  } catch (error) {
    console.error('Error creating vacation:', error.message);
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
};

const getVacationsForApproval = async (req, res) => {
    try {
        const expectVacations = await getExpectVacations();
        return res.status(200).json(expectVacations);
    } catch (error) {
        console.error('Error getting pending approval vacations:', error.message);
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Internal Server Error';
        res.status(statusCode).json({error: errorMessage});
    }
};
const getApprovedVacations = async (req, res) => {
    try {
        const vacations = await approvedVacations();
        res.status(200).json(vacations);
    } catch (error) {
        console.error('Error getting pending approval vacations:', error.message);
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Internal Server Error';
        res.status(statusCode).json({error: errorMessage});
    }
};
const approveVacationById = async (req, res) => {
    try {
        const id = +req.params.id;

        if (!id) {
            throw new GenericError(400, 'Vacation ID is required')
        }
        const updatedVacation = await approveVacation(id)
        if (!updatedVacation) {
            throw new GenericError(404, 'Vacation not found')
        }
        res.status(200).json(updatedVacation)
    } catch (error) {
        console.error('Error approving vacation:', error.message)
        const statusCode = error.statusCode || 500
        const errorMessage = error.message || 'Internal Server Error'
        res.status(statusCode).json({error: errorMessage})
    }
}
const rejectVacationById = async (req, res) => {
    try {
        const id = +req.params.id;

        if (!id) {
            throw new GenericError(400, 'Vacation ID is required');
        }
        const rejectedVacation = await rejectVacation(id);
        if (rejectedVacation) {
            res.status(200).json(rejectedVacation)
        }
    } catch (error) {
        console.error('Error rejecting vacation:', error.message)
        const statusCode = error.statusCode || 500
        const errorMessage = error.message || 'Internal Server Error'
        res.status(statusCode).json({error: errorMessage})
    }
}

const getRemainedVacationDays = async (req, res) => {
    try {
        const id = +req.params.id;

        if (!id) {
            throw new GenericError(400, 'Talent ID is required');
        }
        const fixedTalentVacationBalances = await getTalentFixedBalancesValues(id);

        const availableVacationDays = await getTalentRemainedBalanceValues(id, fixedTalentVacationBalances);

        return res.status(200).json(availableVacationDays);
    } catch (error) {
        console.error('Error:', error.message)
        const statusCode = error.statusCode || 500
        const errorMessage = error.message || 'Internal Server Error'
        res.status(statusCode).json({error: errorMessage})
    }
}

const getGainedDays = async (req, res) => {
    try {
        const id = +req.params.id;

        if (!id) {
            throw new GenericError(400, 'Talent id is required');
        }
        const gainedDays = await calculateGainedDays(id);

        return res.status(200).json(gainedDays);
    } catch (error) {
        console.error('Error:', error.message)
        const statusCode = error.statusCode || 500
        const errorMessage = error.message || 'Internal Server Error'
        res.status(statusCode).json({error: errorMessage})
    }
}

const getUsedDays = async (req, res) => {
    try {
        const id = +req.params.id;

        if (!id) {
            throw new GenericError(400, 'Talent id is required');
        }
        const usedDays = await getTalentAllUsedDays(id);

        return res.status(200).json(usedDays);
    } catch (error) {
        console.error('Error:', error.message)
        const statusCode = error.statusCode || 500
        const errorMessage = error.message || 'Internal Server Error'
        res.status(statusCode).json({error: errorMessage})
    }
}

const getAvailableDays = async (req, res) => {
    try {
        const id = +req.params.id;

        if (!id) {
            throw new GenericError(400, 'Talent id is required');
        }
        const availableDays = await getTalentAvailableDaysAllTypes(id);

        return res.status(200).json(availableDays);
    } catch (error) {
        console.error('Error:', error.message)
        const statusCode = error.statusCode || 500
        const errorMessage = error.message || 'Internal Server Error'
        res.status(statusCode).json({error: errorMessage})
    }
}

const getFixedBalanceDays = async (req, res) => {
    try {
        const id = +req.params.id;

        if (!id) {
            throw new GenericError(400, 'Talent id is required');
        }
        const fixedBalances = await getTalentFixedBalancesValues(id);

        return res.status(200).json(fixedBalances);
    } catch (error) {
        console.error('Error:', error.message)
        const statusCode = error.statusCode || 500
        const errorMessage = error.message || 'Internal Server Error'
        res.status(statusCode).json({error: errorMessage})
    }
}

const getTalentHistory = async (req, res) => {
    try {
        const id = +req.params.id;

        if (!id) {
            throw new GenericError(400, 'Talent id is required');
        }
        const {page, pageSize} = req.query;

        const talentHistory = await talentVacationHistory(id, parseInt(page) || 1, parseInt(pageSize) || 10);

    return res.status(200).json(talentHistory)
  } catch (error) {
    console.error('Error:', error.message)
    const statusCode = error.statusCode || 500
    const errorMessage = error.message || 'Internal Server Error'
    res.status(statusCode).json({ error: errorMessage })
  }
}

const talentsOnLeaveToday = async (req, res) => {

  try {
    const records = await getOnLeaveTalentsToday();

    const data =  _(records).groupBy('type').value();

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error.message)
    const statusCode = error.statusCode || 500
    const errorMessage = error.message || 'Internal Server Error'
    res.status(statusCode).json({error: errorMessage})
  }
}

const createOrUpdateVacationBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { talentId, ...vacationBalance } = req.body;

    const existTalent = await getTalentById(talentId);

    if (!existTalent) {
      throw new GenericError(400, 'Cannot find Talent with id: ' + talentId);
    }

    const { vacationDays, sickDays, unpaidDays, bonusDays } = vacationBalance;

    if (vacationDays === undefined || sickDays === undefined || unpaidDays === undefined) {
      throw new GenericError(400, 'Days information are required!');
    }

    const isTalentHaveBalance = await isTalentHaveUniqueBalanceValues(talentId);

    const updatedBalance = {
      vacationDays,
      sickDays,
      unpaidDays,
      bonusDays
    };

    if (isTalentHaveBalance) {
      const updatedCustomVacationBalance = await updateVacationBalance(talentId, updatedBalance);
      return res.status(201).json(updatedCustomVacationBalance);
    } else {
      const createdCustomBalance = await changeVacationBalance(talentId, userId, updatedBalance);
      return res.status(201).json(createdCustomBalance);
    }
  } catch (error) {
    console.error('Error:', error.message);
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Internal Server Error';
    res.status(statusCode).json({ error: errorMessage });
  }
};

const updateVacationRequestByAdmin = async (req, res) => {
  try {
    const id = +req.params.id;
    const {...vacationData} = req.body;
    const talentId = req.body.talentId;
    const type = req.body.type;

    if (vacationData.type === "vacation") {

      if (!daysRangeChecker(vacationData.startDate, vacationData.endDate)) {
        throw new GenericError(400, 'Max period of paid vacation is 10 days');
      }
    }
    const talent = await getTalentById(talentId);
    const fixedBalance = await getTalentFixedBalancesValues(talentId);

    const { vacationDays, sickDays, unpaidDays } = fixedBalance;


    if (talent.startDate <= req.body.startDate) {
      throw new GenericError(400, 'This talent has not yet earned enough vacation days');
    }

    if (!req.body.startDate || !req.body.endDate || !req.body.type) {
      throw new GenericError(400, 'EmployeeId and vacationData are required');
    }
    const startDateMoment = moment(req.body.startDate);
    const endDateMoment = moment(req.body.endDate);
    const rangeInDays = endDateMoment.diff(startDateMoment, 'days') + 1;

    switch (type) {
      case "vacation":
        if (rangeInDays > vacationDays) {
          throw new GenericError(400, "You may not take more days than the fixed yearly vacation days allowance")
        }
        break;
      case "sick":
        if (rangeInDays > sickDays) {
          throw new GenericError(400, "You may not take more days than the fixed yearly sick leave days allowance")
        }
        break;
      case "unpaid":
        if (rangeInDays > unpaidDays) {
          throw new GenericError(400, "You may not take more days than the fixed yearly unpaid leave days allowance")
        }
        break;
    }

    if (endDateMoment.isBefore(startDateMoment)) {
      throw new GenericError(400, 'EndDate cannot be before StartDate');
    }

    const isOneMonthLimitAdhere = isOneMonthPlanningLimit(req.body.startDate);

    if (!isOneMonthLimitAdhere) {
      throw new GenericError(400, 'Talent can book vacation in the range of 1 month');
    }

    if (!vacationData) {
      throw new GenericError(400, 'Data must be provided');
    }

    const isRequestExist = await getRequestById(id);

    if (!isRequestExist) {
      throw new GenericError(404, 'Request not found');
    }

    const updatedRequest = await updateVacationRequest(vacationData);

    return res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error:', error.message)
    const statusCode = error.statusCode || 500
    const errorMessage = error.message || 'Internal Server Error'
    res.status(statusCode).json({ error: errorMessage })
  }
}


module.exports = {
  createVacationRequest,
  getVacationsForApproval,
  approveVacationById,
  getApprovedVacations,
  rejectVacationById,
  getRemainedVacationDays,
  getGainedDays,
  getUsedDays,
  getAvailableDays,
  getFixedBalanceDays,
  getTalentHistory,
  talentsOnLeaveToday,
  createOrUpdateVacationBalance,
  updateVacationRequestByAdmin
};
