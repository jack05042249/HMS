import icons from '../../../icons';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { upcomingHolidaysPush } from '../../../store/actionCreator';
import config from '../../../config';
import moment from 'moment';



const UpcomingHolidays = () => {
  const dispatch = useDispatch()
  const { upcomingHolidays } = useSelector(state => state)
  const [showAll, setShowAll] = useState(false);

  const API_URL = config.API_URL;


  useEffect(() => {
    const fetchData = async () => {
        try {
          const responseUpcomingHolidays = await axios.get(`${API_URL}/holidays/upcoming`);
          dispatch(upcomingHolidaysPush(responseUpcomingHolidays.data));
        }  catch (error) {
          console.error('Error:', error);
        }
    }
    fetchData();
  }, [dispatch])


  let displayedHolidays = upcomingHolidays;

  console.log('Upcoming Holidays:', upcomingHolidays);

  if (!showAll && upcomingHolidays.length > 0) {
    displayedHolidays = [upcomingHolidays[0]];
  } else if (showAll && upcomingHolidays.length > 0) {
    displayedHolidays = upcomingHolidays
  }


  return (
    <div className="bg-[#FFF]  mt-5 h-fit shadow-md rounded-lg py-[35px] px-[60px]">
      <div className="flex items-center mb-5">
        <icons.calendar/>
        <h2 className='text-[#333] text-[16px] ml-[15px] text-left leading-9 font-semibold'>Upcoming Holidays</h2>
      </div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-[12px] text-gray-700 border-b border-gray-100">
        <tr>
          <th scope="col" className="px-6 py-3 font-medium">
            Holiday
          </th>
          <th scope="col" className="px-6 py-3 font-medium">
            Country
          </th>
          <th scope="col" className="px-6 py-3 font-medium">
            Start Date
          </th>
          <th scope="col" className="px-6 py-3 font-medium">
            End Date
          </th>
          <th scope="col" className="px-6 py-3 font-medium">
            Total days
          </th>
        </tr>
        </thead>
        <tbody className="text-[12px]">
        {(displayedHolidays && displayedHolidays.length > 0) ? (
          displayedHolidays.map((holiday, index) => (
            <tr key={index} className="bg-white">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {holiday.name ? holiday.name : '-'}
              </th>
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {holiday.country.name ? holiday.country.name : '-'}
              </th>
              <th scope="row" className="px-6 py-4 text-[#9197B3] font-medium">
                {holiday.date.iso ? moment(holiday.date.iso).format('DD/MM/YYYY') : '-'}
              </th>
              <td className="px-6 py-4 text-[#9197B3]">
                {holiday.date.iso ? moment(holiday.date.iso).format('DD/MM/YYYY') : '-'}
              </td>
              <td className="px-6 py-4 text-[#9197B3]">
                {holiday.date.iso ? moment(holiday.date.iso).diff(moment(holiday.date.iso), 'days') + 1 : '-'}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No upcoming holidays</td>
          </tr>
        )}
        </tbody>
      </table>
      {upcomingHolidays.length >= 2 && (
        <p className="text-[#4D4AEA] text-right text-[12px] pointer" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Less' : 'Show More'}
        </p>
      )}
    </div>
  );
};

export default UpcomingHolidays
