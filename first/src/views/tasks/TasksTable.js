import { useCallback, useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { RISK, STATUS, useGetCustomer, useGetTalent } from '../../utils';
import { TableHeaderItem } from './TableHeaderItem';
import { TableCell } from './TableCell';
import icons from '../../icons';
import GenericModal from '../components/modal/GenericModal';
import UpdateTaskModalContent from '../pendingTasks/UpdateTaskModalContent';
import { DeleteModal } from '../modals';
import axios from 'axios';
import config from '../../config';

const NOTES_MAX_CHAR = 100;
const PAGE_SIZE = 30;

const TasksTable = ({ tasks, derivedColumnsForTask, onEdited, onDeleted }) => {
  const [detailsTask, setDetailsTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  const [visibleCount, setVisibleCount] = useState(0);
  const tableBodyRef = useRef(null);

  useEffect(() => {
    const el = tableBodyRef.current;
    if (!el) {
      // This is important part for handling the initial null value of tableBodyRef
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, tasks.length));
      return;
    }

    const handleScroll = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
        setVisibleCount(prev => Math.min(prev + PAGE_SIZE, tasks.length));
      }
    };

    el.addEventListener('scroll', handleScroll);

    // Initial check for scrollability
    if (el.scrollHeight <= el.clientHeight && visibleCount < tasks.length) {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, tasks.length));
    }

    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [tasks, visibleCount]);


  const cleanTaskToEdit = useCallback(() => setTaskToEdit(null), []);

  const cleanTaskToDelete = useCallback(() => setTaskToDelete(null), []);

  const onSaved = useCallback(
    (prev, next) => {
      cleanTaskToEdit();
      onEdited(prev, next);
    },
    [cleanTaskToEdit, onEdited]
  );

  const onFailedSave = useCallback(({ id }) => {
    console.error(`Failed to update task for talent with id: ${id}`);
  }, []);

  const onDeleteIconClick = useCallback(task => {
    setTaskToDelete(task);
  }, []);

  const onDelete = useCallback(() => {
    const isCustomer = taskToDelete.type === 'customer';
    setIsLoadingDelete(true);
    axios
      .delete(`${config.API_URL}/${isCustomer ? 'tasks-customer-remove' : 'tasks-talent-remove'}/${taskToDelete.id}`)
      .then(() => {
        setTaskToDelete(null);
        onDeleted();
      })
      .catch(e => {
        console.error('Failed to delete task');
        setTaskToDelete(null);
      })
      .finally(() => {
        setIsLoadingDelete(false);
      });
  }, [taskToDelete, onDeleted]);

  if (derivedColumnsForTask.length === 0) {
    return null;
  }

  return (
    <>
    <div ref={tableBodyRef} style={{ maxHeight: '630px', overflowY: 'auto', width: '100%' }}>
      <table className='w-full text-sm text-left rtl:text-right text-gray-500' id={`employees_table`}>
        <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
          <tr>
            <TableHeaderItem>№</TableHeaderItem>
            <TableHeaderItem>Talent / Stakeholder</TableHeaderItem>
            <TableHeaderItem>Customer</TableHeaderItem>
            <TableHeaderItem>Agency</TableHeaderItem>
            <TableHeaderItem>Notes</TableHeaderItem>
            <TableHeaderItem>Status</TableHeaderItem>
            <TableHeaderItem>Risk</TableHeaderItem>
            <TableHeaderItem>Due Date</TableHeaderItem>
            <TableHeaderItem></TableHeaderItem>
          </tr>
        </thead>
        <tbody className='text-[12px]' >
          {tasks.slice(0, visibleCount).map((task, index) => {
            const shouldShowDetails = detailsTask && detailsTask.id === task.id;
            const commentCropped =
              task.comment.length > NOTES_MAX_CHAR ? `${task.comment.substring(0, NOTES_MAX_CHAR)}...` : task.comment;

            return (
              <>
                <tr key={task.id} className='bg-white border-b border-gray-100 text-[#9197B3]'>
                  <TableCell className='whitespace-nowrap'>{index + 1}</TableCell>
                  <TableCell
                    className='justify-end whitespace-nowrap cursor-pointer text-[#020202] hover:underline'
                    onClick={() => {
                      setDetailsTask(prev => (prev === task ? null : task));
                    }}
                  >
                    {derivedColumnsForTask[index].fullName}
                  </TableCell>
                  <TableCell>{task.type === 'employee' ? derivedColumnsForTask[index].Customer : ''}</TableCell>
                  <TableCell>{task.type === 'employee' ? derivedColumnsForTask[index].Agency : ''}</TableCell>
                  <TableCell className='max-w-[200px] overflow-hidden overflow-ellipsis'>{commentCropped}</TableCell>
                  <TableCell>{STATUS[task.status].label}</TableCell>
                  <TableCell>{RISK[task.risk].label}</TableCell>
                  <TableCell>{task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : '-'}</TableCell>
                  <TableCell className='justify-end whitespace-nowrap'>
                    <button onClick={() => setTaskToEdit(task)} className='mr-3'>
                      <icons.editIcon />
                    </button>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => onDeleteIconClick(task)}>
                      <icons.deleteIcon />
                    </button>
                  </TableCell>
                </tr>
                {shouldShowDetails && (
                  <tr class='bg-[#F3F7FD66]'>
                    <td colspan='6' class='pt-[20px] px-[80px]'>
                      <div class='text-[12px]'>
                        <table class='w-full'>
                          <tbody>
                            <tr>
                              <td className='font-bold text-left bg-[rgb(240,240,240)]'>Notes</td>
                            </tr>
                            <tr>
                              <td>{task.comment}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
      <GenericModal displayModal={!!taskToEdit} closeModal={cleanTaskToEdit}>
        {taskToEdit && (
          <UpdateTaskModalContent
            taskToEdit={taskToEdit}
            onCancel={cleanTaskToEdit}
            onSaved={onSaved}
            onFailedSave={onFailedSave}
          />
        )}
      </GenericModal>
      <GenericModal displayModal={!!taskToDelete} closeModal={cleanTaskToDelete}>
        {taskToDelete && (
          <DeleteModal
            title='Delete'
            content={''}
            onCancel={cleanTaskToDelete}
            onDelete={onDelete}
            isDisabled={isLoadingDelete}
          />
        )}
      </GenericModal>
      </div>
    </>
  );
};

export { TasksTable };
