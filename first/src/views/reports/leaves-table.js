import moment from 'moment';
import PageStartLoader from '../loaders/PageStartLoader';
import { pushRecordTablesIds } from '../../store/actionCreator';
import { useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { ReportsFilters } from '../../constants/filters';

const LeavesTable = ({ startDate, endDate, daysArray, record, loading, filterType }) => {
  const dispatch = useDispatch();
  const prevStartDate = useRef(startDate);
  const prevEndDate = useRef(endDate);
  const prevRecord = useRef(record);

  useEffect(() => {
    const tables = document.querySelectorAll('table[id^="report_table_"]');
    const tableIds = Array.from(tables).map(table => table.id);
    dispatch(pushRecordTablesIds(tableIds));

    const recordsChanged = prevRecord.current !== record;
    if (recordsChanged) {
      prevStartDate.current = startDate;
      prevEndDate.current = endDate;
    }
    prevRecord.current = record;
  }, [daysArray]);

  const tableId = `report_table_${record.id}`;

  if (loading || !daysArray.length) {
    return <PageStartLoader />;
  }
  const isAgencyFilterSelected = filterType === ReportsFilters.AGENCY;
  const isTalentFilterSelected = filterType === ReportsFilters.TALENT;

  return (
    <div className='ml-3 max-w-screen my-10'>
      {/*<div className="flex flex-col">*/}
      {/*  <div className="flex items-center my-2">*/}
      {/*    <h1 className="text-left pl-1 text-[20px] font-semibold mr-5">{record.fullName}</h1>*/}
      {/*  </div>*/}
      {/*</div>*/}
      <div className='flex ml-1 w-full'>
        <div className='w-full max-w-[77vw] overflow-x-auto'>
          <table className='text-sm text-left w-fit rtl:text-right text-gray-500' id={tableId}>
            <thead className='text-[12px] w-2/5 text-gray-700 border-b border-gray-100'>
              <tr className='align-top border-t border-[#F5F0F0]'>
                <th className=' font-bold border-b border-[#F5F0F0] whitespace-nowrap py-1 text-[14px] text-gray-700 text-left border border-l-0 border-r-0 border-[#F5F0F0] px-1'>
                  {record.fullName + ' | '}
                  {moment(prevStartDate.current).format('MMMM')}{' '}
                  {moment(prevStartDate.current).format('MMMM') === moment(prevEndDate.current).format('MMMM')
                    ? null
                    : prevEndDate.current
                    ? '- ' + moment(prevEndDate.current).format('MMMM')
                    : null}
                </th>
                {daysArray[0].dates.map((day, idx) => (
                  <th
                    key={idx}
                    scope='col'
                    className='font-medium  border-x text-center border-[#F5F0F0] min-w-[90px] py-1'
                  >
                    {moment(day).format('YYYY/MM/DD')}
                  </th>
                ))}
                <th className='text-[12px] border-r border-[#F5F0F0] text-[#4D4AEA] text-center font-medium w-[35px] py-1'>
                  {' '}
                  Total
                </th>
              </tr>
            </thead>
            <tbody className='text-[12px] max-h-[1000px] overflow-y-scroll'>
              <tr>
                <th className='whitespace-nowrap border-b  font-semibold border-[#F5F0F0] py-2 text-[14px] text-gray-700 text-left border border-l-0 border-r-0 border-[#F5F0F0] px-1'>
                  Vacation days
                </th>
                {daysArray[0].dates.map((date, index) => {
                  const r = record?.usedDates?.vacation
                    ? record?.usedDates?.vacation.find(vacation => vacation.date === date)
                    : null;
                  const isHoliday = r ? r.isHoliday : false;
                  return (
                    <td
                      key={index}
                      className={`border border-[#F5F0F0] text-center min-w-[35px] max-w-[65px] py-1 ${
                        isHoliday ? 'bg-red-500/20' : ''
                      }`}
                    >
                      {/*{record.usedDates && record.usedDates.vacation && record.usedDates.vacation.find(vacation => vacation.date === date) ?*/}
                      {/*  record.usedDates.vacation.find(vacation => vacation.date === date).isHalfDay ? 0.5 : 1 : ''}*/}
                      {r ? (r.isHalfDay ? 0.5 : 1) : ''}
                    </td>
                  );
                })}
                <td className='border border-[#F5F0F0] text-[#4D4AEA] text-center font-bold py-1'>
                  {record.usedByType.usedVacation}
                </td>
              </tr>
              <tr>
                <th className='whitespace-nowrap font-semibold border-b border-[#F5F0F0] py-2 text-[14px] text-gray-700 text-left border border-l-0 border-r-0 border-[#F5F0F0] px-1'>
                  Sick days
                </th>
                {daysArray[0].dates.map((date, index) => {
                  const r = record?.usedDates?.sick
                    ? record?.usedDates?.sick.find(vacation => vacation.date === date)
                    : null;
                  const isHoliday = r ? r.isHoliday : false;
                  return (
                    <td
                      key={index}
                      className={`border border-[#F5F0F0] text-center min-w-[35px] max-w-[65px] py-1 ${
                        isHoliday ? 'bg-red-500/20' : ''
                      }`}
                    >
                      {/*{record.usedDates && record.usedDates.sick && record.usedDates.sick.includes(date) ? 1 : ''} */}
                      {r ? (r.isHalfDay ? 0.5 : 1) : ''}
                    </td>
                  );
                })}
                <td className='border border-[#F5F0F0] text-[#4D4AEA] text-center font-bold py-1'>
                  {record.usedByType.usedSick}
                </td>
              </tr>
              {(isAgencyFilterSelected || isTalentFilterSelected) && (
                <tr>
                  <th className='whitespace-nowrap font-semibold  border-b border-[#F5F0F0] py-2 text-[14px] text-gray-700 text-left border border-l-0 border-r-0 border-[#F5F0F0] px-1'>
                    Unpaid days
                  </th>
                  {daysArray[0].dates.map((date, index) => (
                    <td key={index} className='border border-[#F5F0F0] text-center w-[35px] py-1'>
                      {record.usedDates && record.usedDates.unpaid && record.usedDates.unpaid.includes(date) ? 1 : ''}
                    </td>
                  ))}
                  <td className='border border-[#F5F0F0] text-[#4D4AEA] text-center font-bold py-1'>
                    {record.usedByType.usedUnpaid}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeavesTable;
