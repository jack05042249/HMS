import { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

import icons from '../../icons';
import PageStartLoader from '../loaders/PageStartLoader';
import { NewTask } from './NewTask';
import { DateRangePicker } from './DateRangePicker';
import { getIsAdmin, TYPE } from '../../utils';
import { updateTaskFilter, updateTasks, updateTasksIsLoading, updateAggregatedTalents, updateCustomers } from '../../store/actionCreator';
import { TasksTable } from './TasksTable';
import config from '../../config';
import { PendingTasks } from '../pendingTasks';
import { FilterWidget } from './FilterWidget';
import { PrimaryButton } from '../components/buttons';

const Tasks = () => {
  const { filter, data: tasks, isLoading } = useSelector(state => state.tasks);
  const customers = useSelector(state => state.customers);
  const aggregatedTalents = useSelector(state => state.aggregatedTalents);
  const organizations = useSelector(state => state.organizations);
  const { startDate, endDate, types, statuses, risks } = filter;

  const [derivedColumnsForTask, setDerivedColumnsForTask] = useState([]);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(false);

  const dispatch = useDispatch();
  const isAdminUser = getIsAdmin();
  let promises = [];

  // Load initial data (aggregatedTalents and customers) when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsInitialDataLoading(true);
        
        // Only fetch data if it's not already available in the store
        promises = [];
        
        if (aggregatedTalents.length === 0) {
          promises.push(axios.get(`${config.API_URL}/getAggregatedTalents`));
        }
        
        if (customers.length === 0) {
          promises.push(axios.get(`${config.API_URL}/customers`));
        }
        
        // Note: organizations are loaded in DefaultLayout.js, so we don't need to fetch them here
        
        if (promises.length > 0) {
          const results = await Promise.all(promises);
          
          results.forEach((res, index) => {
            if (res.config.url.includes('getAggregatedTalents')) {
              dispatch(updateAggregatedTalents(res.data.aggregatedTalents));
            } else if (res.config.url.includes('customers')) {
              dispatch(updateCustomers(res.data.customers));
            }
          });
        }
        
        // If no promises were added, it means all data is already available
        if (promises.length === 0) {
          setIsInitialDataLoading(false);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        // Only set loading to false if we actually made API calls
        if (promises.length > 0) {
          setIsInitialDataLoading(false);
        }
      }
    };

    loadInitialData();
  }, [dispatch, aggregatedTalents.length, customers.length, organizations.length]);

  const loadTasks = useCallback(() => {
    if (!statuses.length || !risks.length || !types.length) {
      dispatch(updateTasks([]));
      return;
    }
    // Don't load tasks if initial data is still loading or if required data is missing
    if (isInitialDataLoading || aggregatedTalents.length === 0 || customers.length === 0 || organizations.length === 0) {
      return;
    }
    
    setIsTasksLoading(true);
    dispatch(updateTasksIsLoading(true));

    const statusFilter = statuses.length === 2 ? '' : `status=${statuses[0]}`;
    const riskFilter = risks.length ? `risk=${risks.join(',')}` : '';
    const startDateFilter = startDate ? `startDate=${moment(startDate).format('YYYY-MM-DD')}` : '';
    const endDateFilter = endDate ? `endDate=${moment(endDate).format('YYYY-MM-DD')}` : '';
    const filter = [statusFilter, riskFilter, startDateFilter, endDateFilter].filter(Boolean).join('&');

    const employeeTasksUrl = `${config.API_URL}/tasks-employee?${filter}`;
    const customerTasksUrl = `${config.API_URL}/tasks-customer?${filter}`;

    const isEmployeeTasksChecked = types.includes(TYPE.TALENT.value);
    const isCustomerTasksChecked = types.includes(TYPE.STAKEHOLDER.value);

    

    const promises = Promise.all([
      isEmployeeTasksChecked ? axios.get(employeeTasksUrl) : Promise.resolve({ data: [] }),
      isCustomerTasksChecked ? axios.get(customerTasksUrl) : Promise.resolve({ data: [] }),
    ]);

    promises
      .then(([{ data: employeeTasks }, { data: customerTasks }]) => {

        

        const processedEmployeeTasks = employeeTasks.map(task => ({
          ...task,
          type: 'employee'
        }));
        const processedCustomerTasks = customerTasks.map(task => ({
          ...task,
          type: 'customer'
        }));

        const mergedTasks = [...processedEmployeeTasks, ...processedCustomerTasks].sort(
          (a, b) => new Date(b.dueDate) - new Date(a.dueDate)
        );



        dispatch(updateTasks(mergedTasks));
        setDerivedColumnsForTask(
          mergedTasks.map(task => {
            const object =
                (task.type === 'employee' ? aggregatedTalents.find(t => t.id === task.talentId) : customers.find(c => c.id === task.customerId)) ||
                {};
            let organization = {};
            if (task.type === 'employee') {
              let relevantCustomer = customers.find(c => c.id === object.talentMainCustomer);
              organization = relevantCustomer ? organizations.find(org => org.id === relevantCustomer.organizationId) : {};
            } else {
              organization = organizations.find(org => org.id === object.organizationId) || {};
            }
            return {
              fullName: object.fullName,
              Customer: organization.name || '',
              Agency: object.agencyName || '',
            };
          })
        );
      })
      .finally(() => {
        setIsTasksLoading(false);
        dispatch(updateTasksIsLoading(false));
      });
  }, [dispatch, endDate, risks, startDate, statuses, types, aggregatedTalents, customers, organizations, isInitialDataLoading]);

  const loadTasksRef = useRef(loadTasks);
  loadTasksRef.current = loadTasks;

  const pendingTasksRef = useRef();

  useEffect(() => {
    // Only load tasks after initial data has been loaded
    if (!isInitialDataLoading) {
      // Set tasks loading to true immediately to prevent showing "No tasks found"
      setIsTasksLoading(true);
      loadTasks();
    }
  }, [isInitialDataLoading, loadTasks]);

  // Auto-load tasks when aggregatedTalents or customers change (after initial load)
  useEffect(() => {
    if (!isInitialDataLoading && aggregatedTalents.length > 0 && customers.length > 0 && organizations.length > 0) {
      // Set tasks loading to true immediately to prevent showing "No tasks found"
      setIsTasksLoading(true);
      loadTasks();
    }
  }, [isInitialDataLoading, aggregatedTalents.length, customers.length, organizations.length, loadTasks]);

  const onChangeDates = useCallback(
    ([startDate, endDate]) => dispatch(updateTaskFilter({ startDate, endDate })),
    [dispatch]
  );

  const handleApplyTypeFilter = useCallback(types => dispatch(updateTaskFilter({ types })), [dispatch]);
  const handleApplyStatusFilter = useCallback(statuses => dispatch(updateTaskFilter({ statuses })), [dispatch]);
  const handleApplyRiskFilter = useCallback(risks => dispatch(updateTaskFilter({ risks })), [dispatch]);

  const handleTaskCreated = useCallback(
    createdTaskType => {
      if (types.includes(createdTaskType)) {
        loadTasks();
      }
      pendingTasksRef.current.fetchPendingTasks();
    },
    [loadTasks, types]
  );

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  if (!isAdminUser) {
    return null;
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <span className='w-[24px] h-[24px]'>
            <icons.tasks />
          </span>
          <p className='text-[#333] text-[24px]  font-semibold leading-9 ml-3'>Tasks</p>
        </div>
        <div className='flex gap-3 items-center'>
          <>
            <PrimaryButton onClick={() => setIsNewTaskOpen(true)}>New Task</PrimaryButton>
            <NewTask isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} onCreated={handleTaskCreated} />
          </>
          <PendingTasks ref={pendingTasksRef} />
        </div>
      </div>
      <div className='bg-[#FFF] w-full mt-5 h-fit shadow-md rounded-lg py-[35px]'>
        <div className='flex mb-5 gap-8 px-[20px]'>
          <DateRangePicker startDate={startDate} endDate={endDate} onChange={onChangeDates} clearDates={[]} />
          <FilterWidget
            types={types}
            onApplyTypes={handleApplyTypeFilter}
            statuses={statuses}
            onApplyStatuses={handleApplyStatusFilter}
            risks={risks}
            onApplyRisks={handleApplyRiskFilter}
            onClick={loadTasksRef.current}
          />
        </div>

        {isInitialDataLoading || isLoading || isTasksLoading ? (
          <PageStartLoader />
        ) : (
          <>
            {tasks.length ? (
              <TasksTable tasks={tasks} derivedColumnsForTask={derivedColumnsForTask} onEdited={loadTasks} onDeleted={loadTasks} />
            ) : (
              <p className='font-medium whitespace-nowrap py-1'>
                No tasks found for the selected filters. Please try again with different filters.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Tasks;
