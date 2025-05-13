import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import config from '../config';
import moment from 'moment';

const usePendingTasks = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTasks, setPendingTasks] = useState([]);

  const fetchPendingTasks = useCallback(() => {
    setIsLoading(true);
    const startDate = '1970-01-01'
    const endDate = moment().format('YYYY-MM-DD');
    const filter = `status=OPEN&risk=LOW,MEDIUM,HIGH,CRITICAL&startDate=${startDate}&endDate=${endDate}`;
    const fetchEmployeeTasks = () => axios.get(`${config.API_URL}/tasks-employee?${filter}`);
    const fetchCustomerTasks = () => axios.get(`${config.API_URL}/tasks-customer?${filter}`);
    Promise.all([fetchEmployeeTasks(), fetchCustomerTasks()])
      .then(([{ data: employeeTasks }, { data: customerTasks }]) => {
        setPendingTasks([
          ...employeeTasks.map(task => ({ ...task, type: 'employee' })),
          ...customerTasks.map(task => ({ ...task, type: 'customer' }))
        ]);
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchPendingTasks();
  }, [fetchPendingTasks]);

  return [pendingTasks, isLoading, fetchPendingTasks];
};

export { usePendingTasks };
