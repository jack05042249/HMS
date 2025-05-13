import { useCallback } from 'react';
import clsx from 'clsx';

import { Field } from './Field';
import { showNotificationError } from '../../../utils/notifications';

const TextAreaField = ({ name, id, value, onChange, height, maxChar }) => {
  const handleChange = useCallback((e) => {
    
    if (maxChar && e.target.value.length > maxChar) {
      e.target.value = e.target.value.substring(0, maxChar)
      showNotificationError('You have exceeded the maximum character limit.')
    }
    
    onChange(e);
  }, [onChange, maxChar]);

  return (
    <Field name={name} htmlFor={id}>
      <textarea
        className={clsx(
          `w-full min-h-36 rounded-xl border border-web-border p-4 outline-none text-sm`,
          height ?? 'h-48'
        )}
        id={id}
        value={value}
        onChange={handleChange}
      />
      {maxChar &&
        <div className='flex space-between text-xs px-1'>
          <span>{maxChar} character only</span>
          <span>{value.length}/{maxChar}</span>
        </div>
      }
    </Field>
  );
};

export { TextAreaField };
