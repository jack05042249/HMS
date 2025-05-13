import icons from '../../icons';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { vacationHistoryPush } from '../../store/actionCreator';
import sortArr from '../../utils/sortArr';
import ConfirmReject from '../vacationHistory/confirm-reject';
import { DateHelper } from '../../utils/dateHelper';

const VacationHistory = ({ talentId, API_URL }) => {
  const [page, setPage] = useState(1)
  const { vacationHistory } = useSelector(state => state)
  const dispatch = useDispatch()
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState('created ASC')
  const [deleteRequestMenu, setDeleteRequestMenu] = useState(false)
  const [recordData, setRecordData] = useState()
  const [showTooltip, setShowTooltip] = useState(false);


  const handleDeleteRequest = (record) => {
    setDeleteRequestMenu(!deleteRequestMenu);
    setRecordData(record)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (talentId) {
        try {

          const responseVacationHistory = await axios.get(`${API_URL}/vacation/history/${talentId}?page=${page}&pageSize=5`);
          dispatch(vacationHistoryPush(responseVacationHistory.data));

        }  catch (error) {
          console.error('Error:', error);
        }
      }
    }
    fetchData();
  }, [page, dispatch, talentId])

  const filterRecords = filter ? vacationHistory.vacations.filter(record => {
    const { type, comment } = record;
    if (
      type.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
      comment.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
    ) {
      return true;
    }
    return false;
  }) : vacationHistory.vacations;

  const sortedRecords = sortArr(filterRecords, sortBy)

  const isCancelButtonDisabled = (record) => {
    const today = moment();
    const startDate = moment(record.startDate)
    const endDate = moment(record.endDate)
    return !deleteRequestMenu && (today.isSameOrAfter(startDate) || today.isSameOrAfter(endDate));
  };


  return (
    <>
      {!!deleteRequestMenu && <ConfirmReject
        requestData={recordData}
        onClose={() => setDeleteRequestMenu(false)}
        API_URL={API_URL}
      />}
    <div className="bg-[#FFF]  mt-5 h-fit shadow-md rounded-lg py-[35px] px-[60px]">
      <div className="flex justify-between mb-5">
        <div className="flex items-center">
          <icons.calendarChecked/>
          <h2 className='text-[#333] text-[16px] ml-[15px] text-left leading-9 font-semibold'>Vacations Taken</h2>
        </div>
        <div className="border b-[#E7E7E7] py-[8px] px-[16px] rounded-md w-[300px] flex items-center">
          <span> <icons.search/> </span>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search"
            className="outline-none ml-2.5 text-[12px] w-[200px]"
            type='text'
          />
        </div>
      </div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-[12px] text-gray-700 border-b border-gray-100">
        <tr>
          <th scope="col" className="px-6 py-3 font-medium">
            Start Date
          </th>
          <th scope="col" className="px-6 py-3 font-medium">
            End Date
          </th>
          <th scope="col" className="px-6 py-3 font-medium">
            Total Days
          </th>
          <th scope="col" className="px-6 py-3 font-medium">
            Vacation Type
          </th>
          <th scope="col" className="px-6 py-3 font-medium">
            Comment
          </th>
        </tr>
        </thead>
        <tbody className="text-[12px]">
        {sortedRecords && sortedRecords.length > 0 ? (
          sortedRecords.map((record) => (
            <tr key={record.id} className="bg-white">
              <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                {record.startDate ? moment(record.startDate).format('DD/MM/YYYY') : '-'}
              </th>
              <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                {record.endDate ? moment(record.endDate).format('DD/MM/YYYY') : '-'}
              </th>
              <td className="px-6 py-4 text-center">
                {record.isHalfDay ? "Half Day" : record.endDate && record.startDate ? DateHelper.calculateRangeOfUsedDays(record.startDate, record.endDate) : '-'}
              </td>
              <td className="px-6 py-4 capitalize">
                {record.type ? record.type + ' Leave' : '-'}
              </td>
              <td className="px-6 py-4">
                {record.comment ? record.comment : "No comment is provided"}
              </td>
              <td
                className="px-6 py-4 font-medium whitespace-nowrap relative"
                onMouseEnter={() => setShowTooltip(record.id)}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <button
                  disabled={isCancelButtonDisabled(record)}
                  className="font-medium text-red-500 hover:underline disabled:text-red-300 disabled:line-through disabled:cursor-not-allowed"
                  onClick={() => handleDeleteRequest(record)}
                >
                  Cancel Request
                </button>
                {(showTooltip === record.id && isCancelButtonDisabled(record)) && (
                  <div className="absolute right-[100px] mt-1 bg-gray-50 border border-gray-200 p-2 text-gray-700 w-[430px] text-xs rounded">
                    <p className='text-[#D0004B] max-w-[260px] text-[12px] flex text-left items-center'><p className="mr-[5px]"> <icons.alert/> </p> You cannot cancel a request that has already started or ended </p>
                  </div>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center py-4">No records found</td>
          </tr>
        )}
        </tbody>
      </table>
      <div className="flex justify-between items-center pt-10">
        <button
          className="px-[16px] py-[8px] border-[#E0E0E0] border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => setPage(page - 1)}
          disabled={vacationHistory.currentPage === 1}>
          <span className="text-[14px] text-[#2A2A2A] text-center font-medium">Previous</span>
        </button>
        <p className="text-[14px] font-medium text-[#2A2A2A]">Page {vacationHistory.currentPage} of {vacationHistory.totalPages ? vacationHistory.totalPages : vacationHistory.currentPage}</p>
        <button
          className="px-[16px] py-[8px] border-[#E0E0E0] border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => setPage(page + 1)}
          disabled={vacationHistory.totalPages < 2 || page === vacationHistory.totalPages}>
          <span className="text-[14px] text-[#2A2A2A] text-center font-medium">Next</span>
        </button>
      </div>
    </div>
    </>
  )
}

export default VacationHistory
