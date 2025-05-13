import icons from '../../icons';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { allowedVacationDaysPush, basicVacationValuesPush, usedVacationDaysPush } from '../../store/actionCreator';

const VacationHeader = ({ talentId, API_URL }) => {
  const dispatch = useDispatch();
  const { fixedBalance, usedDays, allowedDays } = useSelector(state => state);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (talentId) {
          const responseAllowedDays = await axios.get(`${API_URL}/vacation/availableDays/${talentId}`);
          dispatch(allowedVacationDaysPush(responseAllowedDays.data));

          const responseUsedDays = await axios.get(`${API_URL}/vacation/usedDays/${talentId}`);
          dispatch(usedVacationDaysPush(responseUsedDays.data));

          const responseBasicValues = await axios.get(`${API_URL}/vacation/fixedBalance/${talentId}`);
          dispatch(basicVacationValuesPush(responseBasicValues.data));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, [talentId, dispatch]);

  return (
    <div className='bg-[#FFF]  h-[155px] shadow-md rounded-lg py-[35px] px-[60px]'>
      <div className='flex justify-center'>
        <div className='flex'>
          <span>
            <icons.vacationCircle />
          </span>
          <span className='relative top-[23px] right-[58px]'>
            <icons.vacationIcon />
          </span>
          <div className='flex flex-col'>
            <p className='text-[14px] tracking-tight'>Available vacation days</p>
            <h2 className='text-left text-[#333] text-[32px] font-semibold'>{allowedDays.availableVacationDays}</h2>
            <div className='flex'>
              <p>
                <span className='text-[#292D32] tracking-tight text-[12px] font-bold'>{fixedBalance.vacationDays}</span>{' '}
                <span className='text-[#9197B3] tracking-tight text-[12px]'>Granted</span>
              </p>
              <p className='relative left-4'>
                <span
                  className={`${
                    usedDays.usedVacationDays !== 0
                      ? 'tracking-tight text-[12px] font-bold text-green-600'
                      : 'tracking-tight text-[12px] font-bold text-red-700'
                  }`}
                >
                  {usedDays.usedVacationDays}
                </span>{' '}
                <span className='text-[#9197B3] tracking-tight text-[12px]'>Used</span>
              </p>
            </div>
          </div>
        </div>
        <div className='bg-[#F0F0F0] w-[1px] h-[87px] relative left-6 mr-10'></div>
        <div className='flex'>
          <span>
            <icons.sickCircle />
          </span>
          <span className='relative top-[27px] right-[57px]'>
            <icons.sickIcon />
          </span>
          <div className='flex flex-col'>
            <p className='text-[14px] tracking-tight'>Available sick leave days</p>
            <h2 className='text-left text-[#333] text-[32px] font-semibold'>{allowedDays.availableSickDays}</h2>
            <div className='flex'>
              <p>
                <span className='text-[#292D32] tracking-tight text-[12px] font-bold'>{fixedBalance.sickDays}</span>{' '}
                <span className='text-[#9197B3] tracking-tight text-[12px]'>Granted</span>
              </p>
              <p className='relative left-7'>
                <span
                  className={`${
                    usedDays.usedSickDays !== 0
                      ? 'tracking-tight text-[12px] font-bold text-green-600'
                      : 'tracking-tight text-[12px] font-bold text-red-700'
                  }`}
                >
                  {usedDays.usedSickDays}
                </span>{' '}
                <span className='text-[#9197B3] tracking-tight text-[12px]'>Used</span>
              </p>
            </div>
          </div>
        </div>
        <div className='bg-[#F0F0F0] w-[1px] h-[87px] relative left-6 mr-10'></div>
        <div className='flex'>
          <span>
            <icons.unpaidCircle />
          </span>
          <span className='relative top-[23px] right-[56px]'>
            <icons.unpaidIcon />
          </span>
          <div className='flex flex-col'>
            <p className='text-[14px] tracking-tight'>Available unpaid leave</p>
            <h2 className='text-left text-[#333] text-[32px] font-semibold'>{allowedDays.availableUnpaidDays}</h2>
            <div className='flex'>
              <p>
                <span className='text-[#292D32] tracking-tight text-[12px] font-bold'>{fixedBalance.unpaidDays}</span>{' '}
                <span className='text-[#9197B3] tracking-tight text-[12px]'>Granted</span>
              </p>
              <p className='relative left-7'>
                <span
                  className={`${
                    usedDays.usedUnpaidDays !== 0
                      ? 'tracking-tight text-[12px] font-bold text-green-600'
                      : 'tracking-tight text-[12px] font-bold text-red-700'
                  }`}
                >
                  {usedDays.usedUnpaidDays}
                </span>{' '}
                <span className='text-[#9197B3] tracking-tight text-[12px]'>Used</span>
              </p>
            </div>
          </div>
        </div>
        <div className='bg-[#F0F0F0] w-[1px] h-[87px] relative left-6 mr-10'></div>
        <div className='flex'>
          <span>
            <icons.bonusOffDaysCircle />
          </span>
          <span className='relative top-[23px] right-[58px]'>
            <icons.bonusIcon />
          </span>
          <div className='flex flex-col'>
            <p className='text-[14px] tracking-tight'>Available extra off days</p>
            <h2 className='text-left text-[#333] text-[32px] font-semibold'>{allowedDays.availableBonusDays}</h2>
            <div className='flex'>
              <p>
                <span className='text-[#292D32] tracking-tight text-[12px] font-bold'>{fixedBalance.bonusDays} </span>
                <span className='text-[#9197B3] tracking-tight text-[12px]'>Granted</span>
              </p>
              <p className='relative left-7'>
                <span
                  className={`${
                    usedDays.usedBonusDays !== 0
                      ? 'tracking-tight text-[12px] font-bold text-green-600'
                      : 'tracking-tight text-[12px] font-bold text-red-700'
                  }`}
                >
                  {usedDays.usedBonusDays}
                </span>{' '}
                <span className='text-[#9197B3] tracking-tight text-[12px]'>Used</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationHeader;
