import clsx from 'clsx';

import icons from '../../icons';
import { usePrevious } from '../../utils';

const MAX_COUNT_TO_DISPLAY = 99;

const PendingTasksBadge = ({ count, onClick }) => {
  const prevCount = usePrevious(count);
  const shouldAnimate = typeof prevCount === 'number' && count > prevCount;
  const isCountOverLimit = count > MAX_COUNT_TO_DISPLAY;

  return (
    <div className='relative' role='button' aria-label='Pending Tasks' onClick={onClick}>
      <div
        key={shouldAnimate && count}
        className={clsx('h-7 w-7 origin-top', shouldAnimate && 'animate-tilt-shake-once')}
      >
        <icons.bell />
      </div>
      <div
        className={clsx(
          'flex items-center justify-center absolute h-5 w-5 -top-2 -right-2 bg-web-indigo rounded-full text-white font-semibold',
          isCountOverLimit ? 'text-[0.6rem]' : 'text-xs'
        )}
      >
        {isCountOverLimit ? `${MAX_COUNT_TO_DISPLAY}+` : count}
      </div>
    </div>
  );
};

export default PendingTasksBadge;
