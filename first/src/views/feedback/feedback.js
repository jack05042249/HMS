import React, { Fragment, useState, useEffect } from 'react';
import icons from '../../icons';
import SortButton from '../components/sortButton/SortButton';
import { FeedbackStatus } from '../components/feedbackStatus';
import sortArr from '../../utils/sortArr';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { exportSortedFeedbacksToExcel } from '../../utils/exportToExcel';
import { pushFeedbacksData } from '../../store/actionCreator';
import config from '../../config';
import axios from 'axios';
import { DateHelper } from '../../utils/dateHelper';
import { generateTableHeaders, generateTableData } from './excelHelper';
import FeedbackDataViewV1 from './feedbackDataViewVersions/feedback-data-view-v1';
import FeedbackDataViewV2 from './feedbackDataViewVersions/feedback-data-view-v2';

const API_URL = config.API_URL;
const getFeedbackVersionTemplate = feedback => {
  switch (feedback.version) {
    case 'v1':
      return FeedbackDataViewV1(feedback);
    case 'v2':
      return FeedbackDataViewV2(feedback);
    // case 'v2': return (<tr></tr>);
  }
};
const Feedback = () => {
  const { feedbacks, questions } = useSelector(state => state);
  const [sortBy, setSortBy] = useState('created ASC');
  const [openDetailsMap, setOpenDetailsMap] = useState({});
  const startOfWeek = DateHelper.getStartOfWeek();
  const [startDate, setStartDate] = useState(startOfWeek);
  const [endDate, setEndDate] = useState(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  const dispatch = useDispatch();
  const onChange = dates => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    const fetchData = async () => {
      const dateStart = moment(startDate).format('YYYY-MM-DD');
      const dateEnd = moment(endDate).format('YYYY-MM-DD');
      try {
        const responseFeedbacks = await axios.get(`${API_URL}/feedback?fromDate=${dateStart}&toDate=${dateEnd}`);
        dispatch(pushFeedbacksData(responseFeedbacks.data));
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, [startDate, endDate, dispatch]);

  const clearFilterDatepickerData = () => {
    setStartDate(startOfWeek);
    setEndDate(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
  };

  const handleDecreaseWeek = () => {
    const [newStartDate, newEndDate] = DateHelper.decreaseWeek(startDate, endDate);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleIncreaseWeek = () => {
    const [newStartDate, newEndDate] = DateHelper.increaseWeek(startDate, endDate);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const toggleDetails = id => {
    setOpenDetailsMap(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const sortedFeedbacks = sortArr(feedbacks, sortBy);

  const tableData = generateTableData(sortedFeedbacks);
  const tableHeaders = generateTableHeaders(feedbacks, questions);
  const combinedData = [tableHeaders, ...tableData];

  return (
    <div>
      <div className='flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <span className='w-[24px] h-[24px]'>
            <icons.feedback />
          </span>
          <p className='text-[#333] text-[24px]  font-semibold leading-9 ml-3'>Feedback</p>
        </div>
      </div>
      <div className='bg-[#FFF] w-full mt-5 h-fit shadow-md rounded-lg py-[35px]'>
        <div className='flex items-center mb-5 justify-between px-[20px]'>
          <div className='border b-[#E7E7E7] py-[8px] px-[16px] rounded-md w-[350px] flex items-center'>
            <button className='mr-[4rem]' onClick={() => handleDecreaseWeek()}>
              {' '}
              <icons.arrowLeft />{' '}
            </button>
            <span>
              {' '}
              <icons.calendarDotes style={{ width: '18px', height: '18px' }} />{' '}
            </span>
            <DatePicker
              selected={startDate}
              onChange={onChange}
              showMonthDropdown={true}
              showYearDropdown={true}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              maxDate={endDate || new Date(new Date().getFullYear(), 11, 31)}
              dateFormat='dd/MM/yyyy'
              className='text-[12px] outline-none ml-1 mr-[2.5rem] w-[160px]'
            />
            <button className='relative right-3' onClick={clearFilterDatepickerData}>
              {' '}
              <icons.closeModal />{' '}
            </button>
            <button onClick={() => handleIncreaseWeek()}>
              {' '}
              <icons.arrowRight />{' '}
            </button>
          </div>
          <div>
            <button
              onClick={() => exportSortedFeedbacksToExcel(combinedData)}
              className='text-[#4D4AEA] w-[150px]  text-[12px] flex items-center justify-between font-medium py-[8px] px-[16px]'
            >
              <span>
                {' '}
                <icons.downloadIcon />{' '}
              </span>{' '}
              Download excel{' '}
            </button>
          </div>
        </div>
        <table className=' w-full text-sm text-left rtl:text-right text-gray-500 overflow-x-scroll' id='feedback_table'>
          <thead className='text-[12px] w-2/5 text-gray-700 border-b border-gray-100'>
            <tr>
              <th scope='col' className='px-6 py-3 font-medium'>
                №
              </th>
              <th scope='col' className='px-6 py-3 font-medium'>
                Name
                <SortButton sortBy={sortBy} setSortBy={setSortBy} />
              </th>
              <th scope='col' className='px-6 py-3 font-medium '>
                Project Name
                <SortButton sortBy={sortBy} setSortBy={setSortBy} />
              </th>
              <th scope='col' className='px-6 py-3 font-medium '>
                Month
              </th>
              <th scope='col' className='px-6 py-3 font-medium '>
                Year
                <SortButton sortBy={sortBy} setSortBy={setSortBy} />
              </th>
            </tr>
          </thead>
          <tbody className='text-[12px] max-h-[1000px] overflow-y-scroll'>
            {sortedFeedbacks && sortedFeedbacks.length > 0 ? (
              sortedFeedbacks.map((feedback, index) => (
                <Fragment key={feedback.id}>
                  <tr className='font-normal border-t b-[#E7E7E7]'>
                    <td className='py-4 px-6 justify-end font-medium whitespace-nowrap text-[#9197B3]'>{index + 1}</td>
                    <td
                      onClick={() => toggleDetails(feedback.id)}
                      className='py-4 px-6 justify-end font-medium whitespace-nowrap cursor-pointer text-[#020202] hover:underline'
                    >
                      {feedback.talent.fullName}
                    </td>
                    <td className='py-4 px-6 justify-end font-medium whitespace-nowrap text-[#333333]'>
                      {feedback.talent.projectName || 'No project'}
                    </td>
                    <td className='py-4 px-6 justify-end font-medium whitespace-nowrap text-[#333333]'>
                      {moment(feedback.createdAt).format('MMMM')}
                    </td>
                    <td className='py-4 px-6 justify-end font-medium whitespace-nowrap text-[#333333]'>
                      {moment(feedback.createdAt).format('YYYY')}
                    </td>
                    <td className='py-4 px-6 justify-between font-medium whitespace-nowrap flex items-center'>
                      <FeedbackStatus status={feedback.status} />
                      <span
                        className='cursor-pointer'
                        onClick={feedback.data ? () => toggleDetails(feedback.id) : null}
                      >
                        {feedback.data ? (
                          openDetailsMap[feedback.id] ? (
                            <icons.selectIcon style={{ width: '14px', height: '14px' }} />
                          ) : (
                            <icons.arrowRight style={{ width: '14px', height: '14px' }} />
                          )
                        ) : null}
                      </span>
                    </td>
                  </tr>
                  {openDetailsMap[feedback.id] && getFeedbackVersionTemplate(feedback)}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan='5' className='text-center py-4'>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Feedback;
