import moment from 'moment';
const generateTableHeaders = (feedbacks, questions) => {
  const headers = [];

  headers.push('Full Name', 'Project Name', 'Sent At', 'Agency Name', 'Project Understanding', 'Role Clarity', 'Team Collaboration', 'Challenges', 'Leadership', 'Productivity', 'Overall Satisfaction', 'Vacation');

  for (const key in questions) {
    if (questions.hasOwnProperty(key)) {
      headers.push(questions[key]);
    }
  }

  return headers;
};


const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD');
};


const getTableRowData = (feedback) => {
  const rowData = [];

  rowData.push(
    feedback.talent.fullName,
    feedback.talent.projectName,
    formatDate(feedback.createdAt),
    feedback.talent.agency.name
  );

  for (let i = 0; i <= 7; i++) {
    let answer = null;
    if (feedback.data) {
      if (feedback.data[i] && feedback.data[i].answers && feedback.data[i].answers.length > 0) {
        answer = feedback.data[i].answers[0].question + '\n' + feedback.data[i].answers[0].answer;
      }
    }
    rowData.push(answer !== null ? answer : 'No answer provided');
  }

  return rowData;
};


const generateTableData = (feedbacks) => {
  const tableData = [];

  feedbacks.forEach((feedback) => {
    tableData.push(getTableRowData(feedback));
  });

  return tableData;
};

export { generateTableData, generateTableHeaders, getTableRowData }