import clsx from 'clsx';

const SecondaryButton = ({ onClick, isDisabled, children }) => (
  <button
    onClick={isDisabled ? undefined : onClick}
    className={clsx({
      'w-36 px-4 mr-2.5 py-2 border-web-secondary-button-border border rounded-md font-medium text-web-secondary-button-text text-sm': true,
      'opacity-50': isDisabled,
      'cursor-default': isDisabled
    })}
  >
    {children}
  </button>
);

export { SecondaryButton };
