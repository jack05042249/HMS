import { useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import icons from '../../icons';
import { DateHelper } from '../../utils';

const DateRangePicker = ({ startDate, endDate, onChange, clearDates }) => {
  const clearFilterDatepickerData = useCallback(() => {
    if (clearDates) {
      onChange(clearDates)
      return;
    }
    const startOfMonth = DateHelper.getStartOfMonth();
    const endOfMonth = DateHelper.getEndOfMonth(startOfMonth);
    onChange([startOfMonth, endOfMonth]);
  }, [onChange, clearDates]);

  const handleMonthManipulate = useCallback(
    type => {
      if (!startDate || !endDate) {
        clearFilterDatepickerData();
        return;
      }
      if (type === 'decrease') {
        const [newStartDate, newEndDate] = DateHelper.decreaseMonth(startDate, endDate);
        onChange([newStartDate, newEndDate]);
      } else if (type === 'increase') {
        const [newStartDate, newEndDate] = DateHelper.increaseMonth(startDate, endDate);
        onChange([newStartDate, newEndDate]);
      }
    },
    [clearFilterDatepickerData, endDate, onChange, startDate]
  );

  const handleDecreaseMonth = useCallback(() => handleMonthManipulate('decrease'), [handleMonthManipulate]);

  const handleIncreaseMonth = useCallback(() => handleMonthManipulate('increase'), [handleMonthManipulate]);

  return (
    <div className='border b-[#E7E7E7] max-h-[40px] py-[8px] px-[16px] rounded-md w-[350px] flex items-center'>
      <button className='mr-[4rem]' onClick={handleDecreaseMonth}>
        <icons.arrowLeft />
      </button>
      <span>
        {' '}
        <icons.calendarDotes style={{ width: '18px', height: '18px' }} />{' '}
      </span>
      <DatePicker
        selected={startDate}
        onChange={onChange}
        showMonthDropdown={false}
        showYearDropdown={true}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        dateFormat='dd/MM/yyyy'
        className='text-[12px] outline-none ml-1 mr-[2.5rem] w-[160px]'
        readOnly={false}
      />
      <button className='relative right-3' onClick={clearFilterDatepickerData}>
        <icons.closeModal />
      </button>
      <button className='mr-[4rem]' onClick={handleIncreaseMonth}>
        <icons.arrowRight />
      </button>
    </div>
  );
};

export { DateRangePicker };
