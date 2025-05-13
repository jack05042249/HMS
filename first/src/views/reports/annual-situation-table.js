import PageStartLoader from '../loaders/PageStartLoader';
import { useEffect, useRef } from 'react';
import { ReportsFilters } from '../../constants/filters';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { pushRecordTablesIds } from '../../store/actionCreator';

const AnnualSituationTable = ({ startDate, endDate, currentYear, monthsArray, record, loading, filterType }) => {
  const dispatch = useDispatch();
  const prevStartDate = useRef(startDate);
  const prevRecord = useRef(record);

  const tableId = `report_table_${record.talentId}`;

  useEffect(() => {
    const tables = document.querySelectorAll('table[id^="report_table_"]');
    const tableIds = Array.from(tables).map(table => table.id);
    dispatch(pushRecordTablesIds(tableIds));

    const recordsChanged = prevRecord.current !== record;
    if (recordsChanged) {
      prevStartDate.current = startDate;
    }
    prevRecord.current = record;
  }, [loading]);

  if (loading) {
    return <PageStartLoader />;
  }

  const isAgencyFilterSelected = filterType === ReportsFilters.AGENCY;
  const isTalentFilterSelected = filterType === ReportsFilters.TALENT;

  return (
    <div className='ml-4 my-10'>
      {/*<div className="flex flex-col">*/}
      {/*  <div className="flex items-center my-2">*/}
      {/*    <h1 className="text-left text-[20px] font-semibold mr-5">{record.fullName}</h1>*/}
      {/*  </div>*/}
      {/*</div>*/}
      <div className='flex ml-1'>
        {/*<div className="text-[14px] text-gray-700 text-left border border-l-0 border-r-0 border-[#F5F0F0] pl-5 w-[200px]">*/}
        {/*  <div className="whitespace-nowrap font-medium  border-b border-[#F5F0F0] py-2 w-full">Vacation days used</div>*/}
        {/*  <div className="whitespace-nowrap font-medium   border-[#F5F0F0] py-2 w-full">Sick days used</div>*/}
        {/*  {*/}
        {/*    isSelectedAgencyFilter && <div className="whitespace-nowrap font-medium py-2 w-full">Unpaid days used</div>*/}
        {/*  }*/}
        {/*</div>*/}
        <table className=' w-full text-sm text-left rtl:text-right text-gray-500' id={tableId}>
          <thead className='text-[12px] w-2/5  text-gray-700 border-b border-gray-100'>
            <tr className='align-top border-t border-[#F5F0F0]'>
              <th className='whitespace-nowrap ml-3 font-bold text-[14px] w-fit py-2 border-b border-[#F5F0F0]'>
                {record.fullName} | {moment(prevStartDate.current).format('YYYY')}
              </th>
              {monthsArray.map((month, index) => (
                <th key={index} scope='col' className='font-medium py-2 border-x text-center border-[#F5F0F0] '>
                  {month}
                </th>
              ))}
              <th className='text-[12px] text-[#4D4AEA] text-center py-2 font-medium w-[100px] border-r border-[#F5F0F0]'>
                {' '}
                Total Used
              </th>
              <th className='text-[12px] text-[#4D4AEA] text-center py-2 font-medium w-[100px] border-r border-[#F5F0F0]'>
                {' '}
                Total Granted
              </th>
              <th className='text-[12px] text-[#4D4AEA] text-center  py-2 font-medium w-[100px] border-r border-[#F5F0F0]'>
                {' '}
                Total Left
              </th>
            </tr>
          </thead>
          <tbody className='text-[12px] max-h-[1000px] overflow-y-scroll'>
            {[...Array(1)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                <th className='whitespace-nowrap border-b ml-5  w-fit font-semibold text-[14px] text-gray-700 text-left border border-l-0 border-r-0 border-[#F5F0F0] px-1'>
                  Vacation days used
                </th>
                <td className='border border-[#F5F0F0] py-2 text-center '>
                  {record.monthsData.January.totalVacation === 0 ? '' : record.monthsData.January.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.February.totalVacation === 0 ? '' : record.monthsData.February.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.March.totalVacation === 0 ? '' : record.monthsData.March.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.April.totalVacation === 0 ? '' : record.monthsData.April.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.May.totalVacation === 0 ? '' : record.monthsData.May.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.June.totalVacation === 0 ? '' : record.monthsData.June.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.July.totalVacation === 0 ? '' : record.monthsData.July.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.August.totalVacation === 0 ? '' : record.monthsData.August.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.September.totalVacation === 0 ? '' : record.monthsData.September.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.October.totalVacation === 0 ? '' : record.monthsData.October.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.November.totalVacation === 0 ? '' : record.monthsData.November.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.December.totalVacation === 0 ? '' : record.monthsData.December.totalVacation}
                </td>
                <td className='border border-[#F5F0F0] text-[#4D4AEA] py-2 text-center font-bold w-[100px]'>
                  {record.totalUsed.usedVacationDays}
                </td>
                <td className='border border-[#F5F0F0] text-[#4D4AEA] py-2 text-center font-bold w-[100px]'>
                  {record.totalGranted.vacationDays}
                </td>
                <td className='border border-[#F5F0F0] text-[#4D4AEA] py-2 text-center font-bold w-[100px]'>
                  {record.totalGranted.vacationDays - record.totalUsed.usedVacationDays}
                </td>
              </tr>
            ))}
            {[...Array(1)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                <th className='border-b ml-5 font-semibold w-fit text-[14px] text-gray-700 text-left border  border-l-0 border-r-0 border-[#F5F0F0] px-1'>
                  Sick days used
                </th>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.January.totalSick === 0 ? '' : record.monthsData.January.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.February.totalSick === 0 ? '' : record.monthsData.February.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.March.totalSick === 0 ? '' : record.monthsData.March.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.April.totalSick === 0 ? '' : record.monthsData.April.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.May.totalSick === 0 ? '' : record.monthsData.May.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.June.totalSick === 0 ? '' : record.monthsData.June.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.July.totalSick === 0 ? '' : record.monthsData.July.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.August.totalSick === 0 ? '' : record.monthsData.August.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.September.totalSick === 0 ? '' : record.monthsData.September.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.October.totalSick === 0 ? '' : record.monthsData.October.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.November.totalSick === 0 ? '' : record.monthsData.November.totalSick}
                </td>
                <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                  {record.monthsData.December.totalSick === 0 ? '' : record.monthsData.December.totalSick}
                </td>
                <td className='border border-[#F5F0F0] text-[#4D4AEA] py-2 text-center font-bold w-[100px]'>
                  {record.totalUsed.usedSickDays}
                </td>
                <td className='border border-[#F5F0F0] text-[#4D4AEA] py-2 text-center font-bold w-[100px]'>
                  {record.totalGranted.sickDays}
                </td>
                <td className='border border-[#F5F0F0] text-[#4D4AEA] py-2 text-center font-bold w-[100px]'>
                  {record.totalGranted.sickDays - record.totalUsed.usedSickDays}
                </td>
              </tr>
            ))}
            {(isAgencyFilterSelected || isTalentFilterSelected) &&
              [...Array(1)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <th className='border-b font-semibold ml-5 w-fit border-[#F5F0F0]  text-[14px] text-gray-700 text-left border border-l-0 border-r-0 border-[#F5F0F0] px-1'>
                    Unpaid days used
                  </th>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.January.totalUnpaid === 0 ? '' : record.monthsData.January.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.February.totalUnpaid === 0 ? '' : record.monthsData.February.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.March.totalUnpaid === 0 ? '' : record.monthsData.March.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.April.totalUnpaid === 0 ? '' : record.monthsData.April.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.May.totalUnpaid === 0 ? '' : record.monthsData.May.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.June.totalUnpaid === 0 ? '' : record.monthsData.June.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.July.totalUnpaid === 0 ? '' : record.monthsData.July.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.August.totalUnpaid === 0 ? '' : record.monthsData.August.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.September.totalUnpaid === 0 ? '' : record.monthsData.September.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.October.totalUnpaid === 0 ? '' : record.monthsData.October.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.November.totalUnpaid === 0 ? '' : record.monthsData.November.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] py-2 text-center w-[80px]'>
                    {record.monthsData.December.totalUnpaid === 0 ? '' : record.monthsData.December.totalUnpaid}
                  </td>
                  <td className='border border-[#F5F0F0] text-[#4D4AEA] py-2 text-center font-bold w-[100px]'>
                    {record.totalUsed.usedUnpaidDays}
                  </td>
                  <td className='border border-[#F5F0F0] text-[#4D4AEA] py-2 text-center font-bold w-[100px]'>
                    {record.totalGranted.unpaidDays}
                  </td>
                  <td className='border border-[#F5F0F0] text-[#4D4AEA] py-2 text-center font-bold w-[100px]'>
                    {record.totalGranted.unpaidDays - record.totalUsed.usedUnpaidDays}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnnualSituationTable;
