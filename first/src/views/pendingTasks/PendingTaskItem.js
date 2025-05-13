import { useCallback } from 'react';

import { defaultAvatar, customerAvatar, useGetTalent, useGetCustomer } from '../../utils';

const PendingTaskItem = ({ pendingTask, onClick }) => {
  const onPendingTaskClick = useCallback(() => onClick(pendingTask), [onClick, pendingTask]);
  const isCustomer = pendingTask.type === 'customer';

  const getRelevantTalent = useGetTalent();
  const getRelevantCustomer = useGetCustomer();

  const object = isCustomer ? getRelevantCustomer(pendingTask.customerId) : getRelevantTalent(pendingTask.talentId);

  if (!object) return null;

  return (
    <div
      role='button'
      onClick={onPendingTaskClick}
      className='flex items-center p-1 gap-2 cursor-pointer text-left hover:bg-[linear-gradient(90deg,_theme(colors.white)_0%,_theme(colors.web-indigo-light)_15%,_theme(colors.web-indigo-light)_85%,_theme(colors.white)_100%)]'
    >
      <img
        className='w-9 h-9 rounded shadow-md'
        src={isCustomer ? customerAvatar : object.picture || defaultAvatar}
        alt=''
      />
      <div>
        <h3 className='text-sm font-bold'>{object.fullName}</h3>
        <p className='text-xs'>{object.email}</p>
      </div>
    </div>
  );
};

export default PendingTaskItem;
