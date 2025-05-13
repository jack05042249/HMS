import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import icons from '../../icons';
import UpcomingHolidays from '../components/upcomingHolidays/upcoming-holidays';
import VacationHistory from '../vacationHistory/VacationHistory';
import config from '../../config';
import axios from 'axios';
import { pushOnLeaveData, upcomingAnniversariesPush, upcomingBirthdaysPush } from '../../store/actionCreator';
import moment from 'moment';
import EditTalentModal from '../talents/EditTalentModal';

const Dashboard = () => {
  const {
    upcomingAnniversaries,
    upcomingBirthdays,
    onLeaveToday,
    aggregatedTalents,
    organizations,
    customers,
    agencies
  } = useSelector(state => state);
  const [showAllBirthdays, setShowAllBirthdays] = useState(false);
  const [showAllWorkAnniversary, setShowAllWorkAnniversary] = useState(false);
  const [showRequestListModal, setShowRequestListModal] = useState(false);
  const [showTalentDetails, setShowTalentDetails] = useState();
  const [isDetailsOpened, setIsDetailsOpened] = useState(false);
  const API_URL = config.API_URL;

  const dispatch = useDispatch();

  const toggleRequestListModal = () => {
    setShowRequestListModal(!showRequestListModal);
  };
  const getRelevantTalent = id => {
    return aggregatedTalents.find(cus => +cus.id === +id) || {};
  };
  const getRelevantOrganization = id => {
    return organizations.find(org => +org.id === +id);
  };
  const getRelevantCustomer = id => {
    return customers.find(cus => cus.id === id) || {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseUpcomingAnniversaries = await axios.get(`${API_URL}/holidays/anniversaries`);
        dispatch(upcomingAnniversariesPush(responseUpcomingAnniversaries.data));

        const responseUpcomingBirthdays = await axios.get(`${API_URL}/holidays/birthdays`);
        dispatch(upcomingBirthdaysPush(responseUpcomingBirthdays.data));

        const responseOnLeave = await axios.get(`${API_URL}/vacation/onLeaveToday`);
        dispatch(pushOnLeaveData(responseOnLeave.data));
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, [dispatch]);

  const toggleDetails = talId => {
    setShowTalentDetails(talId);
    setIsDetailsOpened(!isDetailsOpened);
  };

  let displayedAnniversaries;

  if (!showAllWorkAnniversary && upcomingAnniversaries.length > 0) {
    displayedAnniversaries = [upcomingAnniversaries[0]];
  } else if (showAllWorkAnniversary && upcomingAnniversaries.length > 0) {
    displayedAnniversaries = upcomingAnniversaries;
  }

  let displayedBirthdays = upcomingBirthdays;

  if (!showAllBirthdays && upcomingBirthdays.length > 0) {
    displayedBirthdays = [upcomingBirthdays[0]];
  } else if (showAllBirthdays && upcomingBirthdays.length > 0) {
    displayedBirthdays = upcomingBirthdays;
  }

  return (
    <div className='w-full'>
      {showTalentDetails && (
        <EditTalentModal
          agencies={agencies}
          displayModal={!!showTalentDetails}
          closeModal={() => setShowTalentDetails()}
          talentToEdit={getRelevantTalent(showTalentDetails)}
          getRelevantCustomer={getRelevantCustomer}
          customers={customers}
          getRelevantOrganization={getRelevantOrganization}
          API_URL={API_URL}
        />
      )}
      {showRequestListModal && (
        <VacationHistory displayModal={showRequestListModal} closeModal={() => toggleRequestListModal()} />
      )}
      <div className='flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <span className='w-[24px] h-[24px]'>
            <icons.dashboardInactive style={{ width: '24px', height: '24px' }} />
          </span>
          <p className='text-[#333] text-[24px] font-semibold leading-9 ml-2.5'>Dashboard</p>
        </div>
        <div className='flex gap-2 items-center'>
          <button onClick={() => toggleRequestListModal()} className='flex text-[#333] text-[14px] font-medium'>
            Registered Leaves{' '}
          </button>
        </div>
      </div>
      <div className='bg-[#FFF]  h-[155px] shadow-md rounded-lg py-[35px] px-[60px]'>
        <div className='flex xl:justify-center 2xl:justify-center'>
          <div className='flex'>
            <span>
              <icons.vacationCircle />
            </span>
            <span className='relative top-[23px] right-[58px]'>
              <icons.vacationIcon />
            </span>
            <div className='flex flex-col'>
              <p className='text-[14px] tracking-tight'>On Vacation Today</p>
              <h2 className='text-left text-[#333] text-[32px] font-semibold'>
                {onLeaveToday.vacation ? onLeaveToday.vacation.length : 0}
              </h2>
              <div className='flex'>
                <p>
                  <span className='text-[#9197B3] tracking-tight text-[12px]'>People</span>
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
              <p className='text-[14px] tracking-tight'>On Sick Leave Today</p>
              <h2 className='text-left text-[#333] text-[32px] font-semibold'>
                {onLeaveToday.sick ? onLeaveToday.sick.length : 0}
              </h2>
              <div className='flex'>
                <p>
                  <span className='text-[#9197B3] tracking-tight text-[12px]'>People</span>
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
              <p className='text-[14px] tracking-tight'>On Unpaid Leave Today</p>
              <h2 className='text-left text-[#333] text-[32px] font-semibold'>
                {onLeaveToday.unpaid ? onLeaveToday.unpaid.length : 0}
              </h2>
              <div className='flex'>
                <p>
                  <span className='text-[#9197B3] tracking-tight text-[12px]'>People</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='bg-[#FFF]  mt-5 h-fit shadow-md rounded-lg py-[35px] px-[60px]'>
        <div className='flex items-center mb-5'>
          <icons.onLeave />
          <h2 className='text-[#333] text-[16px] ml-[15px] text-left leading-9 font-semibold'>People On Leave Today</h2>
        </div>
        <table className='w-full text-sm text-left rtl:text-right text-gray-500'>
          <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
            <tr>
              <th scope='col' className='px-6 py-3 font-medium'>
                Name
              </th>
              <th scope='col' className='px-6 py-3 font-medium'>
                Start Date
              </th>
              <th scope='col' className='px-6 py-3 font-medium'>
                End Date
              </th>
              <th scope='col' className='px-6 py-3 font-medium'>
                Total days
              </th>
              <th scope='col' className='px-6 py-3 font-medium text-right'>
                Employee Details
              </th>
            </tr>
          </thead>
          <tbody className='text-[12px]'>
            {Object.keys(onLeaveToday).length === 0 ? (
              <tr>
                <td colSpan='5' className='px-6 py-4 text-center font-medium'>
                  No records found for today
                </td>
              </tr>
            ) : (
              Object.keys(onLeaveToday).map((leaveType, index) =>
                onLeaveToday[leaveType].map((leave, leaveIndex) => (
                  <tr key={leaveIndex} className='bg-white'>
                    <td className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>{leave.talent.fullName}</td>
                    <td className='px-6 py-4 text-[#9197B3] font-medium'>
                      {moment(leave.startDate).format('DD/MM/YYYY')}
                    </td>
                    <td className='px-6 py-4 text-[#9197B3]'>{moment(leave.endDate).format('DD/MM/YYYY')}</td>
                    <td className='px-6 py-4 text-[#9197B3]'>
                      {moment(leave.endDate).diff(moment(leave.startDate), 'days') + 1}
                    </td>
                    <td
                      className='px-6 py-4 text-[#4D4AEA] text-right text-[12px] pointer'
                      onClick={() => toggleDetails(leave.talent.id)}
                    >
                      Show Details
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
      <UpcomingHolidays />
      <div className='bg-[#FFF]  mt-5 h-fit shadow-md rounded-lg py-[35px] px-[60px]'>
        <div className='flex items-center mb-5'>
          <icons.calendarStar />
          <h2 className='text-[#333] text-[16px] ml-[15px] text-left leading-9 font-semibold'>Upcoming Birthdays</h2>
        </div>
        <table className='w-full text-sm text-left rtl:text-right text-gray-500'>
          <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
            <tr>
              <th scope='col' className='py-3 font-medium'>
                Birthday of
              </th>
              <th scope='col' className='py-3  font-medium text-left'>
                Date
              </th>
            </tr>
          </thead>
          <tbody className='text-[12px]'>
            {displayedBirthdays && displayedBirthdays.length > 0 ? (
              displayedBirthdays.map((talent, index) => (
                <tr key={index} className='bg-white'>
                  <th scope='row' className='py-4 font-medium text-gray-900 whitespace-nowrap'>
                    {talent.fullName || '-'}
                  </th>
                  <td className='py-4  text-[#9197B3] font-medium text-left'>
                    {moment(talent.birthday).format('DD/MM/YYYY') || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='2' className='px-6 py-4 text-center text-gray-500'>
                  No upcoming birthdays
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {upcomingBirthdays.length >= 2 && (
          <p
            className='text-[#4D4AEA] text-right text-[12px] pointer'
            onClick={() => setShowAllBirthdays(!showAllBirthdays)}
          >
            {showAllBirthdays ? 'Show Less' : 'Show More'}
          </p>
        )}
      </div>
      <div className='bg-[#FFF]  mt-5 h-fit shadow-md rounded-lg py-[35px] px-[60px]'>
        <div className='flex items-center mb-5'>
          <icons.calendarHeart />
          <h2 className='text-[#333] text-[16px] ml-[15px] text-left leading-9 font-semibold'>Work Anniversaries</h2>
        </div>
        <table className='w-full px-10  text-sm text-left rtl:text-right text-gray-500'>
          <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
            <tr>
              <th scope='col' className='py-3 font-medium'>
                Anniversary of
              </th>
              <th scope='col' className='py-3 font-medium text-left'>
                Date
              </th>
            </tr>
          </thead>
          <tbody className='text-[12px]'>
            {displayedAnniversaries && displayedAnniversaries.length > 0 ? (
              displayedAnniversaries.map((anniversary, index) => (
                <tr key={index} className='bg-white'>
                  <th scope='row' className='py-4 font-medium text-gray-900 whitespace-nowrap'>
                    {anniversary.fullName ? anniversary.fullName : '-'}
                  </th>
                  <td className='py-4  text-[#9197B3] font-medium text-left'>
                    {anniversary.startDate ? moment(anniversary.startDate).format('DD/MM/YYYY') : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='2' className='px-6 py-4 text-center text-gray-500'>
                  No upcoming anniversaries
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {upcomingAnniversaries.length >= 2 && (
          <p
            className='text-[#4D4AEA] text-right text-[12px] pointer'
            onClick={() => setShowAllWorkAnniversary(!showAllWorkAnniversary)}
          >
            {showAllWorkAnniversary ? 'Show Less' : 'Show More'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
