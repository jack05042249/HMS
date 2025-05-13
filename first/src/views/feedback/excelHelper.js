import moment from 'moment';
const generateTableHeaders = (feedbacks, questions) => {
  const headers = [];

  headers.push('Full Name', 'Project Name', 'Sent At', 'Agency Name');

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

  for (let i = 1; i <= 6; i++) {
    const answer = feedback.answers ? feedback.answers[`question${i}`] : null;
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