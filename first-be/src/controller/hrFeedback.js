const { getPendingFeedbacks, submitHrFeedback, getTalentFeedbackHistory, updateFeedback, deleteFeedback } = require('../service/HrFeedbacks');

// Get Pending Feedbacks for the current week
const getPendingFeedbacksForWeek = async (req, res) => {
  try {
    const feedbacks = await getPendingFeedbacks();
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit HR feedback and update next feedback date
const submitFeedback = async (req, res) => {
  try {
    const feedbackData = req.body;
    const feedback = await submitHrFeedback(feedbackData);
    res.status(201).json({ message: 'Feedback submitted successfully.', feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Talent's feedback history
const getTalentFeedbackHistoryForTalent = async (req, res) => {
  const { talentId } = req.params;
  try {
    const feedbackHistory = await getTalentFeedbackHistory(talentId);
    res.status(200).json(feedbackHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update specific feedback
const updateFeedbackById = async (req, res) => {
  const { feedbackId } = req.params;
  const updatedData = req.body;
  try {
    const updatedFeedback = await updateFeedback(feedbackId, updatedData);
    res.status(200).json({ message: 'Feedback updated successfully.', feedback: updatedFeedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete specific feedback
const deleteFeedbackById = async (req, res) => {
  const { feedbackId } = req.params;
  try {
    const result = await deleteFeedback(feedbackId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingFeedbacksForWeek,
  submitFeedback,
  getTalentFeedbackHistoryForTalent,
  updateFeedbackById,
  deleteFeedbackById,
};
