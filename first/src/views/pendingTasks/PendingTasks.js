import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';

import PendingTasksBadge from './PendingTasksBadge';
import PendingTasksList from './PendingTasksList';
import UpdateTaskModalContent from './UpdateTaskModalContent';
import GenericModal from '../components/modal/GenericModal';
import { noop, usePendingTasks, useToggle } from '../../utils';

const PendingTasks = forwardRef((_, ref) => {
  const [pendingTasks, isLoading, fetchPendingTasks] = usePendingTasks();

  const [isOpenList, toggleList] = useToggle();

  useImperativeHandle(ref, () => ({
    fetchPendingTasks
  }));

  const [taskToEdit, setTaskToEdit] = useState(null);
  const cleanTaskToEdit = useCallback(() => setTaskToEdit(null), []);

  const onSaved = useCallback(() => {
    fetchPendingTasks();
    cleanTaskToEdit();
  }, [cleanTaskToEdit, fetchPendingTasks]);

  const onPendingTaskClick = useCallback(
    task => {
      toggleList();
      setTaskToEdit(task);
    },
    [toggleList]
  );

  const onFailedSave = useCallback(({ id }) => {
    console.error(`Failed to update task for talent with id: ${id}`);
  }, []);

  return (
    <>
      <div className='relative z-1'>
        <OutsideClickHandler onOutsideClick={isOpenList ? toggleList : noop}>
          <PendingTasksBadge isLoading={isLoading} count={pendingTasks.length} onClick={toggleList} />
          {isOpenList && !isLoading && (
            <div className='absolute right-0 w-80 mt-0.5 animate-fade-in z-50'>
              <PendingTasksList pendingTasks={pendingTasks} onPendingTaskClick={onPendingTaskClick} />
            </div>
          )}
        </OutsideClickHandler>
      </div>
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
    </>
  );
});

export { PendingTasks };
