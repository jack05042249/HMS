import icons from '../../icons';
import PendingTaskItem from './PendingTaskItem';

const PendingTasksList = ({ pendingTasks, onPendingTaskClick }) => {
  const title = pendingTasks.length === 1 ? 'Pending Tasks' : 'Pending Tasks';

  return (
    <div aria-label='Pending Tasks List'>
      <div className='w-0 h-0 border-b-8 border-l-8 border-r-8 border-b-web-indigo border-l-transparent border-r-transparent ml-auto mr-1.5'></div>
      <div className='flex gap-1 items-center bg-web-indigo text-white font-semibold text-sm px-2 py-2.5 rounded-t-md'>
        <icons.pending className='shrink-0' />
        <span>{title}</span>
      </div>
      <div className='border border-web-indigo rounded-b-md bg-white max-h-[226px] overflow-auto'>
        {pendingTasks.length ? (
          <>
            {pendingTasks.map((pendingTask, index) => (
              <div key={pendingTask.id}>
                <PendingTaskItem pendingTask={pendingTask} onClick={onPendingTaskClick} />
                {index !== pendingTasks.length - 1 && (
                  <div className='h-[1px] mx-2 bg-[linear-gradient(90deg,_theme(colors.white)_0%,_theme(colors.web-indigo)_8%,_theme(colors.web-indigo)_92%,_theme(colors.white)_100%)]' />
                )}
              </div>
            ))}
          </>
        ) : (
          <div className='my-2'>No pending tasks</div>
        )}
      </div>
    </div>
  );
};

export default PendingTasksList;
