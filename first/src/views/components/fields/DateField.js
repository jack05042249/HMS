import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

import icons from '../../../icons';
import { Field } from './Field';

import './DateField.scss';

const DateField = ({ name, id, value, minDate, onChange }) => {
  return (
    <Field name={name} htmlFor={id}>
      <span className='absolute top-2/4 -translate-y-2/4 right-3 pointer-events-none z-10'>
        <icons.calendarDotes style={{ width: '18px', height: '18px' }} />
      </span>
      <div className='dateFieldWrapper'>
        <DatePicker
          id={id}
          showMonthDropdown
          showYearDropdown
          selected={value}
          onChange={onChange}
          selectsStart
          minDate={minDate}
          placeholderText='DD/MM/YYYY'
          dateFormat='dd/MM/yyyy'
          className='border w-full border-[#F5F0F0] rounded-lg text-[#9197B3] h-[40px] px-[15px] outline-none'
        />
      </div>
    </Field>
  );
};

export { DateField };
