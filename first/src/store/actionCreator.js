import {
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
    ALL_VACATION_HISTORY,
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
    PUSH_REPORT_RECORDS, PUSH_TABLE_IDS,
    ADD_COUNTRIES,
    UPDATE_TASK_FILTER,
    UPDATE_TASKS,
    UPDATE_TASKS_IS_LOADING
} from './actionTypes';

export const updateUser = (user) => {
    return {
        type: UPDATE_USER,
        payload: user
    }
}

export const setInitialData = (data) => {
    return {
        type: SET_INITIAL_DATA,
        payload: data
    }
}

export const resetState = () => {
    return {
        type: RESET_STATE
    }
}

export const updateAggregatedTalents = (data) => {
    return {
        type: UPDATE_AGGREGATED_TALENTS,
        payload: data
    }
}

export const updateCustomers = (data) => {
    return {
        type: UPDATE_CUSTOMERS,
        payload: data
    }
}

export const updateTalents = (data) => {
    return {
        type: UPDATE_TALENTS,
        payload: data
    }
}

export const updateSingleCustomer = (customer) => {
    return {
        type: UPDATE_SINGLE_CUSTOMER,
        payload: customer
    }
}

export const updateSingleOrganization = (organization) => {
    return {
        type: UPDATE_SINGLE_ORGANIZATION,
        payload: organization
    }
}

export const deleteOrganization = (id) => {
    return {
        type: DELETE_ORGANIZATION,
        payload: id
    }
}

export const deleteCustomer = (id) => {
    return {
        type: DELETE_CUSTOMER,
        payload: id
    }
}

export const updateSingleAggregatedTalent = (talent) => {
    return {
        type: UPDATE_SINGLE_AGGREGATED_TALENT,
        payload: talent
    }
}

export const deleteTalent = (id) => {
    return {
        type: DELETE_TALENT,
        payload: id
    }
}

export const fixedVacationDays = (data) => {
    return {
        type: FIXED_VACATION_DAYS,
        payload: data
    }
}

export const availableVacationDays = (data) => {
    return {
        type: AVAILABLE_VACATION_DAYS,
        payload: data
    }
}

export const vacationHistoryPush = (data) => {
    return {
        type: VACATION_HISTORY_PUSH,
        payload: data
    }
}

export const vacationHistoryUpdate = (data) => {
    return {
        type: VACATION_HISTORY_UPDATE,
        payload: data
    }
}

export const globalVacationHistoryPush = (data) => {
    return {
        type: ALL_VACATION_HISTORY,
        payload: data
    }
}

export const basicVacationValuesPush = (data) => {
    return {
        type: BASIC_VACATION_VALUES,
        payload: data
    }
}

export const usedVacationDaysPush = (data) => {
    return {
        type: USED_DAYS_VALUES,
        payload: data
    }
}

export const allowedVacationDaysPush = (data) => {
    return {
        type: ALLOWED_VACATION_DAYS,
        payload: data
    }
}

export const upcomingHolidaysPush = (data) => {
    return {
        type: PUSH_UPCOMING_HOLIDAYS,
        payload: data
    }
}

export const upcomingAnniversariesPush = (data) => {
    return {
        type: PUSH_UPCOMING_ANNIVERSARIES,
        payload: data
    }
}

export const upcomingBirthdaysPush = (data) => {
    return {
        type: PUSH_UPCOMING_BIRTHDAY,
        payload: data
    }
}

export const pushAgency = (data) => {
    return {
        type: PUSH_AGENCIES,
        payload: data
    }
}

export const updateAgencyData = (data) => {
    return {
        type: UPDATE_AGENCIES,
        payload: data
    }
}

export const deleteAgency = (data) => {
    return {
        type: DELETE_AGENCY,
        payload: data
    }
}

export const pushFeedbacksData = (data) => {
    return {
        type: PUSH_FEEDBACKS,
        payload: data
    }
}

export const pushQuestionsData = (data) => {
    return {
        type: PUSH_QUESTIONS,
        payload: data
    }
}

export const pushOnLeaveData = (data) => {
    return {
        type: PUSH_ON_LEAVE,
        payload: data
    }
}

export const updateGlobalVacationHistoryData = (data) => {
    return {
        type: UPDATE_GLOBAL_VACATION_HISTORY,
        payload: data
    }
}

export const pushReportRecordsData = (data) => {
    return {
        type: PUSH_REPORT_RECORDS,
        payload: data
    }
}

export const pushRecordTablesIds = (data) => {
    return {
        type: PUSH_TABLE_IDS,
        payload: data
    }
}

export const addCountries = (data) => {
    return {
        type: ADD_COUNTRIES,
        payload: data
    }
}

export const updateTaskFilter = data => {
  return {
    type: UPDATE_TASK_FILTER,
    payload: data
  };
};


export const updateTasks = data => {
  return {
    type: UPDATE_TASKS,
    payload: data
  };
};

export const updateTasksIsLoading = data => {
    return {
      type: UPDATE_TASKS_IS_LOADING,
      payload: data
    };
  };
