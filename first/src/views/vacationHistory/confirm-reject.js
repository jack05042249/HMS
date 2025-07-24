import {
  globalVacationHistoryPush,
  vacationHistoryPush,
  usedVacationDaysPush,
  allowedVacationDaysPush
} from '../../store/actionCreator';
import { showNotificationSuccess } from '../../utils/notifications';
import { useDispatch, useSelector } from 'react-redux';
import '../talentProfile/success-modal.scss';
import axios from 'axios';
import icons from '../../icons';
import { localStorageHelper } from '../../utils/localStorage';
import moment from 'moment';
import { useState } from 'react';
import SmallLoader from '../loaders/SmallLoader';
import { DateHelper } from '../../utils/dateHelper';

const ConfirmReject = ({ requestData, API_URL, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { globalVacationHistory, vacationHistory, usedDays, allowedDays } = useSelector(state => state);
  const { id, type, startDate, endDate, isHalfDay } = requestData;
  const dispatch = useDispatch();
  const userType = localStorageHelper.getItem('type');

  const handleCloseButtonClick = () => {
    onClose();
  };
  const handleReject = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/vacation/reject/${id}`);

      if (response.status === 200) {
        let updatedHistory;
        let updatedUsedDays = {};
        let updatedAllowedDays = {};
        if (userType === 'admin') {
          updatedHistory = globalVacationHistory.filter(record => record.id !== id);
          dispatch(globalVacationHistoryPush(updatedHistory));
        } else if (userType === 'talent') {
          updatedHistory = vacationHistory.vacations.filter(record => record.id !== id);
          dispatch(
            vacationHistoryPush({
              ...vacationHistory,
              vacations: updatedHistory
            })
          );

          const diffInDays = isHalfDay ? 0.5 : DateHelper.calculateRangeOfUsedDays(startDate, endDate);
          if (type === 'vacation') {
            updatedUsedDays = {
              ...usedDays,
              usedVacationDays: usedDays.usedVacationDays - diffInDays
            };
            updatedAllowedDays = {
              ...allowedDays,
              availableVacationDays: allowedDays.availableVacationDays + diffInDays
            };
          } else if (type === 'sick') {
            updatedUsedDays = {
              ...usedDays,
              usedSickDays: usedDays.usedSickDays - diffInDays
            };
            updatedAllowedDays = {
              ...allowedDays,
              availableSickDays: allowedDays.availableSickDays + diffInDays
            };
          } else if (type === 'unpaid') {
            updatedUsedDays = {
              ...usedDays,
              usedUnpaidDays: usedDays.usedUnpaidDays - diffInDays
            };
            updatedAllowedDays = {
              ...allowedDays,
              availableUnpaidDays: allowedDays.availableUnpaidDays + diffInDays
            };
          }
          dispatch(usedVacationDaysPush(updatedUsedDays));
          dispatch(allowedVacationDaysPush(updatedAllowedDays));
        }
        showNotificationSuccess('Request was deleted');
        setLoading(false);
        onClose();
      }
    } catch (error) {
      setLoading(false);
      console.error('Error rejecting vacation request:', error);
    }
  };
  return (
    <div className='success-modal'>
      <div className='success-modal-content'>
        <div className='flex'>
          <div className='relative top-0.5 mr-1'>
            {' '}
            <icons.deleteIcon style={{ width: '22px', height: '22px' }} />{' '}
          </div>
          <div className='flex justify-start flex-col'>
            <div className='flex justify-start items-center relative'>
              <h1 className='text-[#333] text-[20px] font-medium'> Cancel Vacation Request</h1>
            </div>
            <h2 className='text-[14px] text-left font-medium font-[#000]'>
              Are you sure you want to cancel this vacation request?
            </h2>
            <p className='text-[#9197B3] text-[16px] text-left my-3 capitalize'>
              Cancelled Leave type <span className='font-medium text-[#333]'>{type}</span>
            </p>
            <div className='text-[14px] mt-2 flex mb-2'>
              <p className='mr-3'>
                Start Day: <span className='text-[#9197B3]'>{moment(startDate).format('DD/MM/YYYY')}</span>
              </p>
              <p>
                End Day: <span className='text-[#9197B3]'>{moment(endDate).format('DD/MM/YYYY')}</span>
              </p>
            </div>
          </div>
        </div>
        <div className='flex items-center justify-center'>
          <button
            className='w-[120px] px-[16px] mr-2.5 py-[8px] border-[#E0E0E0] border rounded-lg font-medium text-[#020202] text-[14px]'
            onClick={handleCloseButtonClick}
          >
            No, Cancel
          </button>
          <button
            onClick={() => handleReject(id)}
            className='px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[120px] text-[14px] text-[#fff]'
            disabled={loading}
          >
            {loading ? <SmallLoader tiny /> : 'Yes, delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmReject;
