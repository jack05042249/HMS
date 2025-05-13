import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import config from '../../config';
import GenericModal from '../components/modal/GenericModal';
import { showNotificationSuccess } from '../../utils/notifications';
import icons from '../../icons';
import SuccessModal from './success-modal';
import UpcomingHolidays from '../components/upcomingHolidays/upcoming-holidays';
import VacationHistory from './vacation-history';
import VacationHeader from './vacation-header';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { vacationHistoryUpdate, allowedVacationDaysPush, usedVacationDaysPush } from '../../store/actionCreator';
import SmallLoader from '../loaders/SmallLoader';
import { DateHelper } from '../../utils/dateHelper';

const API_URL = config.API_URL;

const TalentProfile = () => {
  const [loading, setLoading] = useState(false);
  const [createRequestModal, setCreateRequestModal] = useState();
  const { user, usedDays, allowedDays } = useSelector(state => state);
  const [error, setError] = useState('');
  const talentId = user.id;
  const initValues = {
    startDate: '',
    endDate: '',
    type: '',
    comment: '',
    talentId: talentId,
    isHalfDay: false
  };
  const initState = { values: initValues };
  const [formState, setFormState] = useState(initState);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showHalfDayCheckbox, setShowHalfDayCheckbox] = useState(false);
  const [busyDates, setBusyDates] = useState([]);
  const [records, setRecords] = useState([]);
  const today = moment();
  let minDate = moment().subtract(13, 'days');
  minDate = minDate.toDate();
  const oneMonthDifferentFromToday = today.clone().add(1, 'months');

  const dispatch = useDispatch();

  const closeModal = () => {
    setCreateRequestModal();
    setError('');
    setFormState({
      values: {
        startDate: '',
        endDate: '',
        type: '',
        comment: '',
        isHalfDay: false
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (talentId) {
        try {
          const responseVacationHistory = await axios.get(
            `${API_URL}/vacation/history/${talentId}?page=1&pageSize=100`
          );
          setRecords(responseVacationHistory.data);
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };
    fetchData();
  }, [dispatch, talentId, allowedDays]);
  function getDatesBetween(startDate, endDate) {
    const dates = [];
    let firstDayOfVacation = moment(startDate);
    const lastDayOfVacation = moment(endDate);

    while (firstDayOfVacation.isSameOrBefore(lastDayOfVacation, 'day')) {
      dates.push(firstDayOfVacation.format('YYYY-MM-DD'));
      firstDayOfVacation.add(1, 'days');
    }

    return dates;
  }

  useEffect(() => {
    if (records && records.vacations) {
      const allOccupiedDates = records.vacations.reduce((occupied, { startDate, endDate }) => {
        const datesBetween = getDatesBetween(startDate, endDate);
        return [...occupied, ...datesBetween];
      }, []);
      setBusyDates(allOccupiedDates);
    }
  }, [records]);

  const { values } = formState;
  const handleChangeForm = ({ target }) =>
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [target.name]: target.value
      }
    }));

  const handleSendRequest = async () => {
    try {
      const requestData = {
        talentId: talentId,
        startDate: moment(values.startDate).format('YYYY-MM-DD'),
        endDate: moment(values.endDate).format('YYYY-MM-DD'),
        type: values.type,
        comment: values.comment,
        isHalfDay: values.isHalfDay
      };

      let hasError = false;

      if (!requestData.startDate || !requestData.endDate || !requestData.type) {
        setError('All fields besides comment are required');
        hasError = true;
      } else if (moment(requestData.startDate).isAfter(requestData.endDate)) {
        setError('Start Date cannot be after End Date');
        hasError = true;
      } else {
        setError('');
      }

      const datesBetween = getDatesBetween(requestData.startDate, requestData.endDate);
      const overlappingDates = datesBetween.filter(date => busyDates.includes(date));
      if (overlappingDates.length > 0) {
        setError('The range of dates includes days that are already busy. Pick other dates');
        hasError = true;
      }

      if (!hasError) {
        setLoading(true);
        if (requestData.type !== 'vacation' && requestData.type !== 'sick' && requestData.type !== 'bonus') {
          requestData.isHalfDay = false;
        }
        const response = await axios.post(`${API_URL}/vacation/createRequest`, requestData);
        if (response.status === 201) {
          setSuccessData(response.data);
          const { startDate, endDate, type, comment, id, isHalfDay } = response.data;
          const newRecord = {
            startDate,
            endDate,
            type,
            comment,
            id,
            isHalfDay
          };

          const diffInDays = DateHelper.calculateRangeOfUsedDays(startDate, endDate);

          let usedDaysToUpdate = {
            ...usedDays,
            usedVacationDays:
              values.type === 'vacation'
                ? usedDays.usedVacationDays + (values.isHalfDay ? diffInDays - 0.5 : diffInDays)
                : usedDays.usedVacationDays,
            usedSickDays:
              values.type === 'sick'
                ? usedDays.usedSickDays + (values.isHalfDay ? diffInDays - 0.5 : diffInDays)
                : usedDays.usedSickDays,
            usedUnpaidDays: values.type === 'unpaid' ? usedDays.usedUnpaidDays + diffInDays : usedDays.usedUnpaidDays,
            usedBonusDays:
              values.type === 'bonus'
                ? usedDays.usedBonusDays + (values.isHalfDay ? diffInDays - 0.5 : diffInDays)
                : usedDays.usedBonusDays
          };

          let allowedDaysToUpdate = {
            ...allowedDays,
            availableVacationDays:
              values.type === 'vacation'
                ? allowedDays.availableVacationDays - (values.isHalfDay ? diffInDays - 0.5 : diffInDays)
                : allowedDays.availableVacationDays,
            availableSickDays:
              values.type === 'sick'
                ? allowedDays.availableSickDays - (values.isHalfDay ? diffInDays - 0.5 : diffInDays)
                : allowedDays.availableSickDays,
            availableUnpaidDays:
              values.type === 'unpaid' ? allowedDays.availableUnpaidDays - diffInDays : allowedDays.availableUnpaidDays,
            availableBonusDays:
              values.type === 'bonus'
                ? allowedDays.availableBonusDays - (values.isHalfDay ? diffInDays - 0.5 : diffInDays)
                : allowedDays.availableBonusDays
          };

          dispatch(usedVacationDaysPush(usedDaysToUpdate));
          dispatch(allowedVacationDaysPush(allowedDaysToUpdate));
          dispatch(vacationHistoryUpdate(newRecord));

          setSuccessModalVisible(true);
          setLoading(false);

          showNotificationSuccess('Vacation request was uploaded');
          closeModal();
          setFormState({
            values: {
              startDate: '',
              endDate: '',
              type: '',
              comment: '',
              isHalfDay: false
            }
          });
        }
      }
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      console.error('Error sending form:', error);
    }
  };

  const checkSameDay = (startDate, endDate) => {
    return (
      (values.type === 'vacation' || values.type === 'sick' || values.type === 'bonus') &&
      startDate &&
      endDate &&
      startDate.getTime() === endDate.getTime()
    );
  };

  useEffect(() => {
    setShowHalfDayCheckbox(checkSameDay(values.startDate, values.endDate));
  }, [values.startDate, values.endDate, values.type]);

  const renderCreateRequestModal = () => {
    return (
      <div>
        <div className='flex items-center mb-[15px]'>
          <icons.vacationModal />
          <h1 className='text-left text-[#333] text-[20px] font-medium ml-[15px]'>Register vacation</h1>
        </div>
        <form onSubmit={event => event.preventDefault()}>
          <div className='flex'>
            <div className='flex flex-col justify-start p-5 text-[14px]'>
              <label htmlFor='type' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
                Leave Type
              </label>
              <span className='relative left-[280px] top-[24px] pointer-events-none'>
                {' '}
                <icons.selectIcon />{' '}
              </span>
              <select
                className='border border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
                id='type'
                name='type'
                value={values.type}
                onChange={handleChangeForm}
              >
                <option>Select type</option>
                <option value='vacation'>Vacation</option>
                <option value='sick'>Sick</option>
                <option value='unpaid'>Unpaid</option>
                <option value='bonus'>Extra off days</option>
              </select>
              <label htmlFor='startDate' className='text-[#000] text-[14px] font-medium text-left my-[12px]'>
                Start Date
              </label>
              <DatePicker
                name='startDate'
                id='startDate'
                selected={values.startDate}
                onChange={date => handleChangeForm({ target: { name: 'startDate', value: date } })}
                selectsStart
                placeholderText={'DD/MM/YYYY'}
                startDate={values.startDate}
                endDate={values.endDate}
                // minDate={minDate}
                maxDate={oneMonthDifferentFromToday.toDate()}
                dateFormat='dd/MM/yyyy'
                excludeDates={busyDates.map(date => new Date(date))}
                className={
                  !error
                    ? `border border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] outline-none`
                    : `border border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] outline-none text-[#D0004B]`
                }
              />
              <label htmlFor='endDate' className='text-[#000] text-[14px] font-medium text-left my-[12px]'>
                End Date
              </label>
              <DatePicker
                name='endDate'
                id='endDate'
                selected={values.endDate}
                onChange={date => handleChangeForm({ target: { name: 'endDate', value: date } })}
                selectsEnd
                placeholderText={'DD/MM/YYYY'}
                startDate={values.startDate}
                endDate={values.endDate}
                // minDate={minDate}
                maxDate={oneMonthDifferentFromToday.toDate()}
                dateFormat='dd/MM/yyyy'
                excludeDates={busyDates.map(date => new Date(date))}
                className={
                  !error
                    ? `border border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] outline-none`
                    : `border border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] outline-none text-[#D0004B]`
                }
              />
            </div>
            <div className='flex flex-col justify-start h-[300px]'>
              <label htmlFor='comment' className='text-[#000] text-[14px] font-medium text-left my-[17px]'>
                Comment
              </label>
              <textarea
                className='w-[310px] h-[215px] rounded-xl border border-[#F5F0F0] p-4 resize-none outline-none text-[12px]'
                id='comment'
                name='comment'
                value={values.comment}
                onChange={handleChangeForm}
              />
              {showHalfDayCheckbox && (
                <div className='flex justify-start'>
                  <input
                    type='checkbox'
                    id='halfDay'
                    name='isHalfDay'
                    checked={values.isHalfDay}
                    onChange={event =>
                      handleChangeForm({
                        target: { name: 'isHalfDay', value: event.target.checked }
                      })
                    }
                  />
                  <label htmlFor='halfDay' className='text-[#000] text-[14px] font-medium text-left ml-[5px]'>
                    Half Day
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className='flex justify-end'>
            {error && (
              <span className='text-[#D0004B] max-w-[260px] text-[12px] flex text-left items-center'>
                <span className='mr-[5px]'>
                  {' '}
                  <icons.alert />{' '}
                </span>{' '}
                {error}
              </span>
            )}
            <div className='flex justify-end text-[14px] font-medium ml-[65px]'>
              <button
                onClick={() => closeModal()}
                className='px-[16px] py-[8px] border border-[#E0E0E0] rounded-md w-[141px] mr-[15px]'
              >
                <span>Cancel</span>
              </button>
              <button
                onClick={() => handleSendRequest()}
                disabled={loading}
                className='px-[16px] py-[8px] bg-[#4D4AEA] rounded-md w-[150px]'
              >
                <span className='text-[#FFF]'>{loading ? <SmallLoader tiny /> : 'Submit'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className='lg:w-full'>
      {!!createRequestModal && (
        <GenericModal displayModal={!!createRequestModal} closeModal={closeModal}>
          {renderCreateRequestModal()}
        </GenericModal>
      )}
      {!!successModalVisible && (
        <SuccessModal
          successData={successData}
          isVisible={successModalVisible}
          onClose={() => setSuccessModalVisible(false)}
        />
      )}
      <div className='flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <span className='w-[24px] h-[24px]'>
            <icons.userDark />
          </span>
          <p className='text-[#333] text-[24px] font-semibold leading-9 ml-2.5'>{user.fullName}</p>
        </div>
        <button
          className='px-[16px] py-[8px] bg-[#4D4AEA] rounded-md text-[#FFF] text-[14px] font-medium'
          onClick={() => setCreateRequestModal(-1)}
        >
          Register Vacation +
        </button>
      </div>
      <VacationHeader API_URL={API_URL} talentId={talentId} />
      <UpcomingHolidays API_URL={API_URL} />
      <VacationHistory API_URL={API_URL} talentId={talentId} />
    </div>
  );
};

export default TalentProfile;
