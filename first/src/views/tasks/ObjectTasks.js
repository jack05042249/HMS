import { useState, useLayoutEffect, useCallback, useMemo } from 'react';
import moment from 'moment/moment';
import axios from 'axios';
import clsx from 'clsx';

import SmallLoader from '../loaders/SmallLoader';
import config from '../../config';
import { RISK, STATUS } from '../../utils';
import { FilterWidget } from '../tasks/FilterWidget';

const ObjectTasks = ({ id, type }) => {
  const [tasks, setTask] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statuses, setStatuses] = useState([STATUS.CLOSED.value, STATUS.OPEN.value]);
  const [risks, setRisks] = useState([RISK.LOW.value, RISK.MEDIUM.value, RISK.HIGH.value, RISK.CRITICAL.value]);

  const isCustomer = type === 'customer';

  const fetchTasks = useCallback(() => {
    setIsLoading(true);
    const url = isCustomer ? `${config.API_URL}/tasks-customer/${id}` : `${config.API_URL}/tasks-employee/${id}`;

    axios
      .get(url)
      .then(({ data }) => {
        setIsLoading(false);
        setTask(data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, isCustomer]);

  useLayoutEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        return statuses.includes(task.status) && risks.includes(task.risk);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [risks, statuses, tasks]);

  if (isLoading) {
    return (
      <div className='h-72 flex items-center justify-center'>
        <SmallLoader />
      </div>
    );
  }

  if (error) {
    return <p>Failed to load</p>;
  }

  return (
    <div className='flex gap-8 flex-col'>
      <FilterWidget
        hideTypeFilter
        statuses={statuses}
        onApplyStatuses={setStatuses}
        risks={risks}
        onApplyRisks={setRisks}
        hideShowButton
      />
      <div className='text-sm text-left max-w-[900px] max-h-[420px] overflow-auto px-3'>
        {filteredTasks.length === 0 && <p>No tasks found with the selected filters</p>}
        {filteredTasks.map((task, index) => (
          <>
            <div key={task.id} className='flex flex-col gap-3'>
              <div>
                <b>{index + 1}.</b>
              </div>
              <div className='flex justify-between'>
                <div className='flex flex-col gap-2'>
                  <TaskItem name='Notes'>{task.comment}</TaskItem>
                  <TaskItem name='Due Date'>{task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : '-'}</TaskItem>
                </div>
                <div>
                  <TaskItem name='Risk'>
                    <span className={clsx('font-bold', RISK[task.risk].color)}>{RISK[task.risk].label}</span>
                  </TaskItem>
                  <TaskItem name='Status'>{STATUS[task.status].label}</TaskItem>
                </div>
              </div>
            </div>
            {index !== tasks.length - 1 && (
              <div className='my-3 h-[1px] mx-2 bg-[linear-gradient(90deg,_theme(colors.white)_0%,_theme(colors.web-gray-divider)_8%,_theme(colors.web-gray-divider)_92%,_theme(colors.white)_100%)]' />
            )}
          </>
        ))}
      </div>
    </div>
  );
};

const TaskItem = ({ name, children }) => {
  return (
    <div>
      <div className='font-bold'>{name}</div>
      {children}
    </div>
  );
};
export { ObjectTasks };
