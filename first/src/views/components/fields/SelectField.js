import { useMemo } from 'react';
import icons from '../../../icons';
import { Field } from './Field';

export const SELECT_NOT_SELECTED = '__SELECT_NOT_SELECTED__' + Math.random();

const SelectField = ({ name, id, value: valueRaw, onChange, options }) => {
  const valueMissingInOptions = useMemo(
    () => !options.find(option => `${option.value}` === `${valueRaw}`),
    [options, valueRaw]
  );

  const value = useMemo(
    () => (valueMissingInOptions ? SELECT_NOT_SELECTED : valueRaw),
    [valueMissingInOptions, valueRaw]
  );

  return (
    <Field name={name} htmlFor={id}>
      <span className='absolute top-2/4 -translate-y-2/4 right-3 pointer-events-none'>
        <icons.selectIcon />
      </span>
      <select
        className='w-full border border-web-border text-web-text rounded-lg h-10 px-4 appearance-none outline-none'
        id={id}
        value={value}
        onChange={onChange}
      >
        {valueMissingInOptions && (
          <option disabled selected value={SELECT_NOT_SELECTED}>
            -- select an option --
          </option>
        )}
        {options.map(({ value, label }) => {
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </Field>
  );
};

export { SelectField };
