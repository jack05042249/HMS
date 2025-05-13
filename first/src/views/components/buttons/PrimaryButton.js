import clsx from 'clsx';
import SmallLoader from '../../loaders/SmallLoader';

const PrimaryButton = ({ onClick, isDisabled, isLoading, children }) => (
  <button
    onClick={isDisabled ? undefined : onClick}
    disabled={isDisabled}
    className={clsx({
      'px-4 py-2 bg-web-primary-button-bg font-medium rounded-md w-40 text-sm text-white': true,
      'opacity-50': isDisabled,
      'cursor-default': isDisabled
    })}
  >
    {isLoading ? <SmallLoader tiny /> : children}
  </button>
);

export { PrimaryButton };
