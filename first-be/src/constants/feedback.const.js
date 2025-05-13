const { config } = require('../config');

const questions = Object.freeze({
    v1: {
        question1: "Have you taken vacation/sick lately and recorded in the ITMS System ?",
        question2: "Do you think you were 100% productive this week / month ?",
        question3: "Have you had any delays with your tasks during this week/month?",
        question4: "How is your cooperation with your Team Leader?",
        question5: "Are there any current job openings within the company that you would recommend or refer us to? Please share the details.",
        question6: "Do you have any comments, suggestions or concerns that you would like to share with us?",
    },
    v2: {
        section1: {
            title: 'Project Understanding',
            questions: {
                1: {
                    question: 'How well do you understand the goals and objectives of the current project?',
                    answers: ["Very well", "Moderately well", "Not very well", "Not at all"]
                }
            }
        },
        section2: {
            title: 'Role Clarity',
            questions: {
                1: {
                    question: 'Do you feel clear about your role and responsibilities within the project?',
                    answers: ['Yes, completely', 'Mostly', 'Somewhat', 'Not really']
                }
            }
        },
        section3: {
            title: 'Team Collaboration',
            questions: {
                1: {
                    question: 'How would you rate the collaboration within your project team?',
                    answers: ['Excellent', 'Good', 'Fair', 'Poor']
                },
                2: {
                    question: 'How effective is communication within the team regarding project updates and changes?',
                    answers: ['Very effective', 'Moderately effective', 'Somewhat effective', 'Ineffective']
                }
            }
        },
        section4: {
            title: 'Challenges',
            questions: {
                1: {
                    question: 'What are the biggest challenges you face in completing your tasks on this project?',
                    answers: 'input'
                }
            }
        },
        section5: {
            title: 'Leadership',
            questions: {
                1: {
                    question: 'How would you rate the leadership and management of the project?',
                    answers: ['Excellent', 'Good', 'Fair', 'Poor']
                }
            }
        },
        section6: {
            title: 'Productivity',
            questions: {
                1: {
                    question: 'Do you feel you have been fully productive this week/month?',
                    answers: ['Yes', 'No', 'Somewhat']
                },
                2: {
                    question: 'Have you encountered any delays in completing your tasks this week/month?',
                    answers: ['Yes', 'No']
                },
                3: {
                    question: 'On a scale of 1 to 10, how would you rate your collaboration with your Team Leader',
                    answers: ['1 (Very poor)', '2', '3', '4', '5', '6', '7', '8', '9', '10 (Excellent)']
                }
            }
        },
        section7: {
            title: 'Overall Satisfaction',
            questions: {
                1: {
                    question: 'On a scale of 1 to 10, how satisfied are you with your involvement in this project?',
                    answers: ['1 (Not satisfied at all)', '2', '3', '4', '5', '6', '7', '8', '9', '10 (Completely satisfied)']
                }
            }
        },
        section8: {
            title: 'Vacation',
            questions: {
                1: {
                    question: 'Have you taken a vacation/sick day lately?',
                    answers: ['Yes', 'No']
                },
                2: {
                    question: 'If yes, have you recorded them in ITMS?',
                    answers: ['Yes', 'No']
                }
            }
        },
    }
})

const frequencies = {
    ONCE_WEEK: '1w',
    TWICE_WEEK: '2w',
    ONCE_MONTH: '1m',
};

const feedbackActions = {
    TO_RESEND: 'toResend',
    TO_OVERDUE: 'toOverdue',
    TO_CREATE: 'toCreate'
}

const feedbackStatus = {
    SENT: 'sent',
    RESENT: 'resent',
    ANSWERED: 'answered',
    OVERDUE: 'overdue'
}
module.exports = Object.freeze({
    FEEDBACK_STATUS: feedbackStatus,
    QUESTIONS: questions,
    FREQUENCIES: frequencies,
    FEEDBACK_ACTIONS: feedbackActions
})
