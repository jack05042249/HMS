const { PendingFeedbacks, HrFeedbacks } = require('../models');
const {Op} = require('sequelize');
const moment = require('moment');

// Get Pending Feedbacks for the current week
const getPendingFeedbacks = async () => {
  const today = moment().startOf('week'); // Start of the current week
  const nextWeek = moment().endOf('week'); // End of the current week

  // Fetch pending feedbacks within this week
  return await PendingFeedbacks.findAll({
    where: {
      nextFeedbackDate: {
        [Op.gte]: today.toDate(),
        [Op.lte]: nextWeek.toDate(),
      },
    },
  });
};

// Submit HR feedback and update next feedback date
const submitHrFeedback = async (feedbackData) => {
  const { talentId, hrName, hrEmail, comment, risk, actionItems } = feedbackData;
  const feedbackDate = new Date();

  // Save the feedback
  const feedback = await HrFeedbacks.create({
    talentId,
    hrName,
    hrEmail,
    comment,
    risk,
    actionItems,
    feedbackDate,
  });

  // Update the next feedback date
  const pendingFeedback = await PendingFeedbacks.findOne({ where: { talentId } });
  if (pendingFeedback) {
    let nextFeedbackDate;

    // Update feedback schedule
    const monthsSinceLastFeedback = moment().diff(pendingFeedback.nextFeedbackDate, 'months');
    if (monthsSinceLastFeedback < 1) {
      nextFeedbackDate = moment().add(1, 'week'); // Weekly feedback for the first month
    } else if (monthsSinceLastFeedback < 2) {
      nextFeedbackDate = moment().add(2, 'weeks'); // Bi-weekly feedback for second month
    } else {
      nextFeedbackDate = moment().add(1, 'month'); // Monthly feedback after two months
    }

    // Update next feedback date
    await pendingFeedback.update({ nextFeedbackDate: nextFeedbackDate.toDate() });
  }

  return feedback;
};

// Get Talent's feedback history
const getTalentFeedbackHistory = async (talentId) => {
  return await HrFeedbacks.findAll({
    where: { talentId },
    order: [['feedbackDate', 'DESC']], // Get the most recent feedback first
  });
};

// Update a specific feedback
const updateFeedback = async (feedbackId, updatedData) => {
  const feedback = await HrFeedbacks.findByPk(feedbackId);
  if (feedback) {
    await feedback.update(updatedData);
    return feedback;
  } else {
    throw new Error('Feedback not found');
  }
};

// Delete a specific feedback
const deleteFeedback = async (feedbackId) => {
  const feedback = await HrFeedbacks.findByPk(feedbackId);
  if (feedback) {
    await feedback.destroy();
    return { message: 'Feedback deleted successfully' };
  } else {
    throw new Error('Feedback not found');
  }
};

module.exports = {
  getPendingFeedbacks,
  submitHrFeedback,
  getTalentFeedbackHistory,
  updateFeedback,
  deleteFeedback,
};
