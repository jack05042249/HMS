import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import { TableHeaderItem } from '../tasks/TableHeaderItem';
import { TableCell } from '../tasks/TableCell';
import PageStartLoader from '../loaders/PageStartLoader';
import { NewTask } from '../tasks/NewTask';
import { TYPE, useGetCustomer, useGetTalent } from '../../utils';
import config from '../../config';

const TasksReport = () => {
  const [data, setData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [newTaskObject, setNewTaskObject] = useState(null);

  const getRelevantTalent = useGetTalent();
  const getRelevantCustomer = useGetCustomer();

  const updateTasksList = useCallback(() => {
    const abortController = new AbortController();
    setIsLoading(true);
    axios
      .get(`${config.API_URL}/tasks-report`)
      .then(({ data }) => {
        const tasks = data.flat();
        setData(
          tasks.map(task => ({
            ...task,
            type: Array.isArray(task.TasksCustomers) ? TYPE.STAKEHOLDER.value : TYPE.TALENT.value
          }))
        );
      })
      .finally(() => setIsLoading(false));
    return abortController;
  }, []);

  useEffect(() => {
    const abortController = updateTasksList();
    return () => {
      abortController.abort();
    };
  }, [updateTasksList]);

  if (isLoading) {
    return <PageStartLoader />;
  }

  if (!data.length) {
    return <p>No Tasks</p>;
  }

  return (
    <>
      <table className='w-full text-sm text-left rtl:text-right text-gray-500' id={`employees_table`}>
        <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
          <tr>
            <TableHeaderItem>№</TableHeaderItem>
            <TableHeaderItem>Talent / Main Stakeholder</TableHeaderItem>
            <TableHeaderItem>Type</TableHeaderItem>
          </tr>
        </thead>
        <tbody className='text-[12px]'>
          {data.map((item, index) => {
            const isTalent = item.type === TYPE.TALENT.value;
            const object = (isTalent ? getRelevantTalent(item.id) : getRelevantCustomer(item.id)) || {};
            return (
              <>
                <tr key={item.id} className='bg-white border-b border-gray-100 text-[#9197B3]'>
                  <TableCell className='whitespace-nowrap'>{index + 1}</TableCell>
                  <TableCell
                    className='justify-end whitespace-nowrap cursor-pointer text-[#020202] hover:underline'
                    onClick={() => setNewTaskObject(item)}
                  >
                    {object.fullName}
                  </TableCell>
                  <TableCell className='whitespace-nowrap text-[#020202]'>
                    {isTalent ? 'Talent' : 'Stakeholder'}
                  </TableCell>
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
      <NewTask
        defaultType={newTaskObject?.type}
        defaultObjectId={newTaskObject?.id}
        isOpen={Boolean(newTaskObject)}
        onClose={() => setNewTaskObject(null)}
        onCreated={updateTasksList}
      />
    </>
  );
};

export { TasksReport };
