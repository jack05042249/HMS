import icons from '../../icons';
import './success-modal.scss'
import moment from 'moment';
import { useEffect, useState } from 'react';
import { DateHelper } from '../../utils/dateHelper';

const SuccessModal = ({ successData, isVisible, onClose }) => {
  const handleCloseButtonClick = () => {
    onClose();
  };

  useEffect(() => {
    const handleClickInside = (event) => {
      const modalContent = document.querySelector('.success-modal-content');
      if (modalContent && modalContent.contains(event.target)) {
        return;
      }
    };

    const handleClickOutside = () => {
      onClose();
    };

    if (isVisible) {
      document.addEventListener('click', handleClickInside);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickInside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="success-modal">
      <div className="success-modal-content">
        <div className="flex flex-col justify-center items-center p-5">
          <span className="mb-4"> <icons.vacationSuccess/> </span>
          <h1 className="text-[#333] text-[16px] font-medium">
            Vacation Request Submitted
          </h1>
          <div className="text-[14px] mt-4 flex mb-2">
            <p className="mr-3">Start: <span className="text-[#9197B3]">{moment(successData.startDate).format('DD/MM/YYYY')}</span></p>
            <p>End: <span className="text-[#9197B3]">{moment(successData.endDate).format('DD/MM/YYYY')}</span></p>
          </div>
          <p className="text-[14px] mb-2">Total Days:  <span className="text-[#9197B3]">{successData.isHalfDay ? "Half Day" : DateHelper.calculateRangeOfUsedDays(successData.startDate, successData.endDate)}</span> </p>
          <p className="text-[14px]">Comment: <span className="text-[#9197B3]">{successData.comment ? successData.comment : "No comment is provided"}</span> </p>
          <button onClick={handleCloseButtonClick} className="px-[16px] py-[8px] bg-[#4D4AEA] rounded-md w-[100px] mt-6">
            <span className="text-[14px] font-medium text-[#fff]">OK</span>
          </button>
        </div>
      </div>
    </div>
  );
};


export default SuccessModal;
