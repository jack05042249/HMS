import { cloneDeep } from 'lodash';
import { RISK, STATUS, TYPE, DateHelper } from '../utils';
import {
  ALL_VACATION_HISTORY,
  AVAILABLE_VACATION_DAYS,
  DELETE_CUSTOMER,
  DELETE_ORGANIZATION,
  DELETE_TALENT,
  FIXED_VACATION_DAYS,
  RESET_STATE,
  SET_INITIAL_DATA,
  UPDATE_AGGREGATED_TALENTS,
  UPDATE_CUSTOMERS,
  UPDATE_SINGLE_AGGREGATED_TALENT,
  UPDATE_SINGLE_CUSTOMER,
  UPDATE_SINGLE_ORGANIZATION,
  UPDATE_TALENTS,
  UPDATE_USER,
  VACATION_HISTORY_PUSH,
  BASIC_VACATION_VALUES,
  USED_DAYS_VALUES,
  ALLOWED_VACATION_DAYS,
  PUSH_UPCOMING_HOLIDAYS,
  PUSH_UPCOMING_ANNIVERSARIES,
  PUSH_UPCOMING_BIRTHDAY,
  VACATION_HISTORY_UPDATE,
  PUSH_AGENCIES,
  UPDATE_AGENCIES,
  DELETE_AGENCY,
  PUSH_FEEDBACKS,
  PUSH_QUESTIONS,
  PUSH_ON_LEAVE,
  UPDATE_GLOBAL_VACATION_HISTORY,
  PUSH_REPORT_RECORDS,
  PUSH_TABLE_IDS,
  ADD_COUNTRIES,
  UPDATE_TASK_FILTER,
  UPDATE_TASKS,
  UPDATE_TASKS_IS_LOADING
} from './actionTypes';

const initialState = {
  user: {},
  organizations: [],
  customers: [],
  talents: [],
  aggregatedTalents: [],
  vacations: {
    vacationDays: 0,
    sickDays: 0,
    unpaidDays: 0,
    bonusDays: 0
  },
  availableVacation: {
    gainedVacationDays: 0,
    gainedSickDays: 0,
    gainedUnpaidDays: 0
  },
  vacationHistory: [],
  globalVacationHistory: [],
  fixedBalance: {
    vacationDays: 0,
    sickDays: 0,
    unpaidDays: 0,
    bonusDays: 0
  },
  usedDays: {
    usedVacationDays: 0,
    usedSickDays: 0,
    usedUnpaidDays: 0,
    usedBonusDays: 0
  },
  allowedDays: {
    availableVacationDays: 0,
    availableSickDays: 0,
    availableUnpaidDays: 0,
    availableBonusDays: 0
  },
  upcomingHolidays: [],
  upcomingAnniversaries: [],
  upcomingBirthdays: [],
  agencies: [],
  feedbacks: [],
  questions: {},
  onLeaveToday: [],
  reportRecords: [],
  tablesIdsToExport: [],
  countries: [],
  tasks: {
    filter: {
      types: [TYPE.TALENT.value, TYPE.STAKEHOLDER.value],
      statuses: [STATUS.OPEN.value],
      risks: [RISK.LOW.value, RISK.MEDIUM.value, RISK.HIGH.value, RISK.CRITICAL.value],
      startDate: undefined,
      endDate: undefined
    },
    isLoading: false,
    data: []
  }
};

const updateUser = (state, user) => {
  const clonedState = cloneDeep(state);
  clonedState.user = user;
  return clonedState;
};

const resetState = () => {
  return initialState;
};

const updateAggregatedTalents = (state, data) => {
  return { ...state, ...data };
};

const updateSingleOrganization = (state, organization) => {
  const clonedState = cloneDeep(state);
  const idx = clonedState.organizations.findIndex(org => +org.id === +organization.id);
  if (idx !== -1) {
    clonedState.organizations.splice(idx, 1, organization);
  } else {
    clonedState.organizations.push(organization);
  }
  return clonedState;
};

const updateCustomers = (state, payload) => {
  const clonedState = cloneDeep(state);
  clonedState.customers = payload;
  return clonedState;
};

const setInitialData = (state, payload) => {
  if (payload && payload.aggregatedTalents) {
    payload.aggregatedTalents.forEach(element => {
      if (element.TalentCustomers) {
        element.cusIds = element.TalentCustomers.map(tc => tc.CustomerId);
        delete element.TalentCustomers;
      }
    });
  }
  return { ...state, ...payload };
};

const updateSingleCustomer = (state, customer) => {
  const clonedState = cloneDeep(state);
  const idx = clonedState.customers.findIndex(cus => +cus.id === +customer.id);
  if (idx !== -1) {
    clonedState.customers.splice(idx, 1, customer);
  } else {
    clonedState.customers.push(customer);
  }
  return clonedState;
};

const deleteOrganization = (state, id) => {
  const clonedState = cloneDeep(state);
  const idx = clonedState.organizations.findIndex(cus => +cus.id === +id);
  clonedState.organizations.splice(idx, 1);
  const filteredCustomers = clonedState.customers.filter(cus => +cus.organizationId !== +id);
  clonedState.customers = filteredCustomers;
  return clonedState;
};

const deleteCustomer = (state, id) => {
  const clonedState = cloneDeep(state);
  const idx = clonedState.customers.findIndex(cus => +cus.id === +id);
  clonedState.customers.splice(idx, 1);
  return clonedState;
};

const updateTalents = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.talents = data;
  return clonedState;
};

const updateSingleAggregatedTalent = (state, talent) => {
  const clonedState = cloneDeep(state);
  const idx = clonedState.aggregatedTalents.findIndex(tal => +tal.id === +talent.id);
  if (idx !== -1) {
    clonedState.aggregatedTalents.splice(idx, 1, talent);
  } else {
    clonedState.aggregatedTalents.push(talent);
  }
  return clonedState;
};

const deleteTalent = (state, id) => {
  const clonedState = cloneDeep(state);
  const idx = clonedState.aggregatedTalents.findIndex(tal => +tal.id === +id);
  clonedState.aggregatedTalents.splice(idx, 1);
  return clonedState;
};

const fixedVacationDays = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.vacations = data;
  return clonedState;
};
const gainedVacationDays = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.availableVacation = data;
  return clonedState;
};

const vacationHistory = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.vacationHistory = data;
  return clonedState;
};

const updateVacationHistory = (state, record) => {
  const clonedState = cloneDeep(state);
  const idx = clonedState.vacationHistory.vacations.findIndex(tal => +tal.id === +record.id);
  if (idx !== -1) {
    clonedState.vacationHistory.vacations.splice(idx, 1, record);
  } else {
    clonedState.vacationHistory.vacations.push(record);
  }
  return clonedState;
};

const globalVacationHistory = (state, data) => {
  const clonnedState = cloneDeep(state);
  clonnedState.globalVacationHistory = data;
  return clonnedState;
};

const basicVacationBalance = (state, data) => {
  const clonnedState = cloneDeep(state);
  clonnedState.fixedBalance = data;
  return clonnedState;
};

const usedDaysBalance = (state, data) => {
  const clonnedState = cloneDeep(state);
  clonnedState.usedDays = data;
  return clonnedState;
};

const allowedDaysBalance = (state, data) => {
  const clonnedState = cloneDeep(state);
  clonnedState.allowedDays = data;
  return clonnedState;
};

const pushUpcomingHolidays = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.upcomingHolidays = data;
  return clonedState;
};

const pushUpcomingAnniversaries = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.upcomingAnniversaries = data;
  return clonedState;
};

const pushUpcomingBirthdays = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.upcomingBirthdays = data;
  return clonedState;
};

const pushAgencies = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.agencies = data;
  return clonedState;
};

const updateAgencies = (state, record) => {
  const clonedState = cloneDeep(state);
  const idx = clonedState.agencies.findIndex(tal => +tal.id === +record.id);
  if (idx !== -1) {
    clonedState.agencies.splice(idx, 1, record);
  } else {
    clonedState.agencies.push(record);
  }
  return clonedState;
};

const pushFeedbacks = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.feedbacks = data;
  return clonedState;
};

const pushQuestions = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.questions = data;
  return clonedState;
};

const deleteAgency = (state, id) => {
  const clonedState = cloneDeep(state);
  const idx = clonedState.agencies.findIndex(agency => +agency.id === +id);
  clonedState.agencies.splice(idx, 1);
  return clonedState;
};

const pushOnLeaveToday = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.onLeaveToday = data;
  return clonedState;
};

const updateGlobalVacationHistory = (state, record) => {
  const clonedState = cloneDeep(state);
  const idx = clonedState.globalVacationHistory.findIndex(record => +record.id === +record.id);
  if (idx !== -1) {
    clonedState.globalVacationHistory.splice(idx, 1, record);
  } else {
    clonedState.globalVacationHistory.push(record);
  }
  return clonedState;
};

const pushReportRecords = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.reportRecords = data;
  return clonedState;
};

const pushTableIds = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.tablesIdsToExport = data;
  return clonedState;
};

const addCountriesReducer = (state, data) => {
  const clonedState = cloneDeep(state);
  clonedState.countries = data;
  return clonedState;
};

const updateTaskFilter = (state, data) => {
  return {
    ...state,
    tasks: {
      ...state.tasks,
      filter: {
        ...state.tasks.filter,
        ...data
      }
    }
  };
};

const updateTasks = (state, data) => {
  return { ...state, tasks: { ...state.tasks, data } };
};

const updateTasksIsLoading = (state, data) => {
  return { ...state, tasks: { ...state.tasks, isLoading: data } };
};

const reducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_USER:
      return updateUser(state, payload);
    case RESET_STATE:
      return resetState();
    case SET_INITIAL_DATA:
      return setInitialData(state, payload);
    case UPDATE_SINGLE_ORGANIZATION:
      return updateSingleOrganization(state, payload);
    case DELETE_ORGANIZATION:
      return deleteOrganization(state, payload);
    case UPDATE_CUSTOMERS:
      return updateCustomers(state, payload);
    case UPDATE_SINGLE_CUSTOMER:
      return updateSingleCustomer(state, payload);
    case UPDATE_AGGREGATED_TALENTS:
      return updateAggregatedTalents(state, payload);
    case UPDATE_SINGLE_AGGREGATED_TALENT:
      return updateSingleAggregatedTalent(state, payload);
    case UPDATE_TALENTS:
      return updateTalents(state, payload);
    case DELETE_TALENT:
      return deleteTalent(state, payload);
    case DELETE_CUSTOMER:
      return deleteCustomer(state, payload);
    case FIXED_VACATION_DAYS:
      return fixedVacationDays(state, payload);
    case AVAILABLE_VACATION_DAYS:
      return gainedVacationDays(state, payload);
    case VACATION_HISTORY_PUSH:
      return vacationHistory(state, payload);
    case ALL_VACATION_HISTORY:
      return globalVacationHistory(state, payload);
    case BASIC_VACATION_VALUES:
      return basicVacationBalance(state, payload);
    case USED_DAYS_VALUES:
      return usedDaysBalance(state, payload);
    case ALLOWED_VACATION_DAYS:
      return allowedDaysBalance(state, payload);
    case PUSH_UPCOMING_HOLIDAYS:
      return pushUpcomingHolidays(state, payload);
    case PUSH_UPCOMING_ANNIVERSARIES:
      return pushUpcomingAnniversaries(state, payload);
    case PUSH_UPCOMING_BIRTHDAY:
      return pushUpcomingBirthdays(state, payload);
    case VACATION_HISTORY_UPDATE:
      return updateVacationHistory(state, payload);
    case PUSH_AGENCIES:
      return pushAgencies(state, payload);
    case UPDATE_AGENCIES:
      return updateAgencies(state, payload);
    case DELETE_AGENCY:
      return deleteAgency(state, payload);
    case PUSH_QUESTIONS:
      return pushQuestions(state, payload);
    case PUSH_FEEDBACKS:
      return pushFeedbacks(state, payload);
    case PUSH_ON_LEAVE:
      return pushOnLeaveToday(state, payload);
    case UPDATE_GLOBAL_VACATION_HISTORY:
      return updateGlobalVacationHistory(state, payload);
    case PUSH_REPORT_RECORDS:
      return pushReportRecords(state, payload);
    case PUSH_TABLE_IDS:
      return pushTableIds(state, payload);
    case ADD_COUNTRIES:
      return addCountriesReducer(state, payload);
    case UPDATE_TASK_FILTER:
      return updateTaskFilter(state, payload);
    case UPDATE_TASKS:
      return updateTasks(state, payload);
    case UPDATE_TASKS_IS_LOADING:
      return updateTasksIsLoading(state, payload);
    default:
      return state;
  }
};

export default reducer;
