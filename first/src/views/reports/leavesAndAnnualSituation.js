import config from '../../config';
import { useEffect, useRef, useState, forwardRef, useCallback, useLayoutEffect } from 'react';
import icons from '../../icons';
import { exportReportsToExcel } from '../../utils/exportToExcel';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { DateHelper } from '../../utils/dateHelper';
import { useSelector, useDispatch } from 'react-redux';
import { ReportsFilters } from '../../constants/filters';
import { QueryParams } from '../../utils/queryParams';
import axios from 'axios';
import { pushReportRecordsData } from '../../store/actionCreator';
import LeavesTable from './leaves-table';
import AnnualSituationTable from './annual-situation-table';
import PageStartLoader from '../loaders/PageStartLoader';
import { useImperativeHandle } from 'react';

const API_URL = config.API_URL;

// I just moved codes from reports.js to here.
// We need to refactor this old code.
const LeavesAndAnnualSituation = ({ type }, ref) => {
  const { organizations, agencies, reportRecords, tablesIdsToExport, aggregatedTalents } = useSelector(state => state);
  const dropdownRef = useRef(null);
  const currentYear = moment().year();
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [showAgencyPopup, setShowAgencyPopup] = useState(false);
  const [showEmployeePopup, setShowEmployeePopup] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedFilter, setSelectedFilter] = useState([]);
  const [agenciesState, setAgenciesState] = useState([]);
  const [talentState, setTalentState] = useState([]);
  const [organizationsState, setOrganizationsState] = useState([]);
  const [showReportsClicked, setShowReportsClicked] = useState(false);
  const startOfMonth = DateHelper.getStartOfMonth();
  const endOfMonth = DateHelper.getEndOfMonth(startOfMonth);
  const [loading, setLoading] = useState(false);
  const [selectAllAgencies, setSelectAllAgencies] = useState(false);
  const [selectAllCustomers, setSelectAllCustomers] = useState(false);
  const [selectAllTalents, setSelectAllTalents] = useState(false);
  const [shouldFetchData, setShouldFetchData] = useState(false);

  const dispatch = useDispatch();

  const [endDate, setEndDate] = useState(endOfMonth);
  const [startDate, setStartDate] = useState(startOfMonth);
  const [daysArray, setDaysArray] = useState([]);

  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);
  const handleMonthManipulate = type => {
    if (!startDate || !endDate) {
      clearFilterDatepickerData();
      return;
    }
    if (type === 'decrease') {
      const [newStartDate, newEndDate] = DateHelper.decreaseMonth(startDate, endDate);
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    } else if (type === 'increase') {
      const [newStartDate, newEndDate] = DateHelper.increaseMonth(startDate, endDate);
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    }
  };

  const handleYearManipulate = type => {
    if (type === 'decrease') {
      const [newStartDate, newEndDate] = DateHelper.decreaseYear(startDate, endDate);
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    } else if (type === 'increase') {
      const [newStartDate, newEndDate] = DateHelper.increaseYear(startDate, endDate);
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    }
  };

  const onChange = dates => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCustomerPopup(false);
        setShowAgencyPopup(false);
        setShowEmployeePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const monthsArray = Array.from({ length: 12 }, (_, index) => moment().month(index).format('MMM'));

  function clearFilterDatepickerData() {
    if (type === 'monthly') {
      setStartDate(startOfMonth);
      setEndDate(endOfMonth);
    } else if (type === 'year') {
      setStartDate(startOfYear);
      setEndDate(endOfYear);
    }
  }

  const filteredAgencies = filter
    ? agencies.filter(org => {
        const { name } = org;
        if (name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())) {
          return true;
        }
        return false;
      })
    : agencies;

  const filteredOrgz = filter
    ? organizations.filter(orgzs => {
        const { name } = orgzs;
        if (
          name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
          name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
        ) {
          return orgzs;
        }
        return null;
      })
    : organizations;

  const filteredTalents = filter
    ? aggregatedTalents.filter(employee => {
        const { fullName } = employee;
        if (
          fullName.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
          fullName.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
        ) {
          return employee;
        }
        return null;
      })
    : aggregatedTalents;

  const handleCheckboxChange = (id, type) => {
    if (type === 'agency') {
      if (id === 'itsoft') {
        const itsoftAgency = agencies.find(agency => agency.name.toLocaleLowerCase() === 'itsoft');
        if (itsoftAgency) {
          setAgenciesState(prevState => {
            if (prevState.includes(itsoftAgency.id)) {
              return prevState.filter(item => item !== itsoftAgency.id);
            } else {
              return [...prevState, itsoftAgency.id];
            }
          });
        }
      } else {
        setAgenciesState(prevState => {
          if (prevState.includes(id)) {
            return prevState.filter(item => item !== id);
          } else {
            return [...prevState, id];
          }
        });
      }
    } else if (type === 'organization') {
      setOrganizationsState(prevState => {
        if (prevState.includes(id)) {
          return prevState.filter(item => item !== id);
        } else {
          return [...prevState, id];
        }
      });
    } else if (type === 'employee') {
      setTalentState(prevState => {
        if (prevState.includes(id)) {
          return prevState.filter(item => item !== id);
        } else {
          return [...prevState, id];
        }
      });
    }
  };

  function handleFetchDataClick() {
    setLoading(true);
    setShouldFetchData(true);
    if (!organizationsState.length && !agenciesState.length && !talentState.length) {
      setSelectedFilter([]);
    }
    if (agenciesState.length && !organizationsState.length && !talentState.length) {
      setSelectedFilter([...selectedFilter, ReportsFilters.AGENCY]);
    }
    if (organizations.length && !agenciesState.length && !talentState.length) {
      setSelectedFilter([...selectedFilter, ReportsFilters.ORGANIZATIONS]);
    }
    if (talentState.length && !organizationsState.length && !agenciesState.length) {
      setSelectedFilter([...selectedFilter, ReportsFilters.TALENT]);
    }
  }

  useEffect(() => {
    const daysInSelectedPeriod = [];
    const datesInSelectedPeriod = [];
    let currentDate = moment(startDate);

    while (currentDate.isSameOrBefore(endDate)) {
      daysInSelectedPeriod.push(currentDate.date());
      datesInSelectedPeriod.push(currentDate.clone().format('YYYY-MM-DD'));
      currentDate.add(1, 'day');
    }
    const combinedArray = [
      {
        days: daysInSelectedPeriod,
        dates: datesInSelectedPeriod
      }
    ];

    setDaysArray(combinedArray);
  }, [shouldFetchData]);

  const toggleShowReports = useCallback(
    type => {
      setLoading(true);
      setShouldFetchData(true);
      if (type === 'monthly') {
        clearFilterDatepickerData();
        setStartDate(startOfMonth);
        setEndDate(endOfMonth);
      } else if (type === 'year') {
        setStartDate(startOfYear);
        setEndDate(endOfYear);
      }
    },
    [clearFilterDatepickerData, endOfMonth, endOfYear, startOfMonth, startOfYear]
  );

  const toggleShowReportsRef = useRef(toggleShowReports);
  toggleShowReportsRef.current = toggleShowReports;

  useLayoutEffect(() => {
    toggleShowReportsRef.current(type);
  }, [type]);

  useImperativeHandle(ref, () => ({
    isLoading: loading
  }));

  const toggleFilters = targetFilter => {
    setLoading(true);
    if (targetFilter === ReportsFilters.ORGANIZATIONS) {
      setShowCustomerPopup(prev => !prev);
      setShowAgencyPopup(false);
      setShowEmployeePopup(false);
      setFilter('');
    }
    if (targetFilter === ReportsFilters.AGENCY) {
      setShowAgencyPopup(prev => !prev);
      setShowCustomerPopup(false);
      setTalentState([]);
      setShowEmployeePopup(false);
      setFilter('');
    }
    if (targetFilter === ReportsFilters.TALENT) {
      setShowCustomerPopup(false);
      setShowAgencyPopup(false);
      setShowEmployeePopup(prev => !prev);
      setFilter('');
    }
    if (
      targetFilter !== ReportsFilters.ORGANIZATIONS &&
      targetFilter !== ReportsFilters.AGENCY &&
      targetFilter !== ReportsFilters.TALENT
    ) {
      setShowCustomerPopup(false);
      setShowAgencyPopup(false);
      setShowEmployeePopup(false);
      setSelectedFilter([ReportsFilters.ORGANIZATIONS]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (shouldFetchData) {
      fetchDataWithFilters();
    }
  }, [showReportsClicked, type, shouldFetchData]);

  const handleShowReportsClick = targetFilter => {
    setShowCustomerPopup(false);
    setShowAgencyPopup(false);
    setShowEmployeePopup(false);
    if (targetFilter === ReportsFilters.ORGANIZATIONS) {
      if (!selectedFilter.includes(ReportsFilters.ORGANIZATIONS)) {
        setSelectedFilter([...selectedFilter, ReportsFilters.ORGANIZATIONS]);
      }
      setShowReportsClicked(true);
      setAgenciesState([]);
      setSelectAllAgencies(false);
      if (!selectedFilter.includes(ReportsFilters.ORGANIZATIONS)) {
        setSelectedFilter([...selectedFilter, ReportsFilters.ORGANIZATIONS]);
      }
    }
    if (targetFilter === ReportsFilters.AGENCY) {
      if (!selectedFilter.includes(ReportsFilters.AGENCY)) {
        setSelectedFilter([...selectedFilter, ReportsFilters.AGENCY]);
      }
      setShowReportsClicked(true);
      setOrganizationsState([]);
      setSelectAllCustomers(false);
      if (!selectedFilter.includes(ReportsFilters.AGENCY)) {
        setSelectedFilter([...selectedFilter, ReportsFilters.AGENCY]);
      }
    }
    if (targetFilter === ReportsFilters.TALENT) {
      setOrganizationsState([]);
      setAgenciesState([]);
      setSelectAllCustomers(false);
      setSelectAllAgencies(false);
      setShowReportsClicked(true);
      if (!selectedFilter.includes(ReportsFilters.TALENT)) {
        setSelectedFilter([...selectedFilter, ReportsFilters.TALENT]);
      }
    }
    handleFetchDataClick(type);
  };

  const fetchDataWithFilters = async () => {
    setLoading(true);
    const payload = {
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD'),
      agencies: agenciesState,
      customers: organizationsState,
      talents: talentState,
      type: type
    };

    const payloadToSearchParams = QueryParams.generateQueryParams(payload);

    try {
      const response = await axios.get(`${API_URL}/reports?${payloadToSearchParams}`);
      dispatch(pushReportRecordsData(response.data));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setShouldFetchData(false);
      setLoading(false);
    }
  };
  const exportAllTablesToExcel = () => {
    const combinedTable = document.createElement('table');
    tablesIdsToExport.forEach(tableId => {
      const table = document.getElementById(tableId);
      if (table) {
        combinedTable.appendChild(table.cloneNode(true));
      }
    });
    const infoObject = {
      date: `${moment(startDate).format('YYYY-MM-DD')}_${moment(endDate).format('YYYY-MM-DD')}`,
      type: `_${type === 'monthly' ? 'leaves' : 'annual'}`,
      filter: selectedFilter ? `_filtered_by_${selectedFilter.toLowerCase()}` : ''
    };
    exportReportsToExcel(combinedTable, type, infoObject);
  };

  const handleSelectAllAgenciesChange = () => {
    setSelectAllAgencies(!selectAllAgencies);
    const allAgencyIds = agencies.map(agency => agency.id);
    if (!selectAllAgencies) {
      setAgenciesState(allAgencyIds);
      if (!selectedFilter.includes(ReportsFilters.AGENCY))
        setSelectedFilter([...selectedFilter, ReportsFilters.AGENCY]);
    } else {
      if (selectedFilter.includes(ReportsFilters.AGENCY)) {
        setSelectedFilter(selectedFilter.filter(filter => filter !== ReportsFilters.AGENCY));
      }
      setAgenciesState([]);
    }
  };

  const handleSelectAllCustomersChange = () => {
    setSelectAllCustomers(!selectAllCustomers);
    const allCustomersIds = organizations.map(org => org.id);
    if (!selectAllCustomers) {
      setOrganizationsState(allCustomersIds);
      if (!selectedFilter.includes(ReportsFilters.ORGANIZATIONS))
        setSelectedFilter([...selectedFilter, ReportsFilters.ORGANIZATIONS]);
    } else {
      if (selectedFilter.includes(ReportsFilters.ORGANIZATIONS)) {
        setSelectedFilter(selectedFilter.filter(filter => filter !== ReportsFilters.ORGANIZATIONS));
      }
      setOrganizationsState([]);
    }
  };

  const handleSelectAllTalentsChange = () => {
    setSelectAllTalents(!selectAllTalents);
    const allTalentIds = aggregatedTalents.map(tal => tal.id);
    if (!selectAllTalents) {
      setTalentState(allTalentIds);
      if (!selectedFilter.includes(ReportsFilters.TALENT))
        setSelectedFilter([...selectedFilter, ReportsFilters.TALENT]);
    } else {
      if (selectedFilter.includes(ReportsFilters.TALENT)) {
        setSelectedFilter(selectedFilter.filter(filter => filter !== ReportsFilters.TALENT));
      }
      setTalentState([]);
    }
  };

  const getSelectedAgenciesNames = () => {
    const names = [];
    agenciesState.forEach(id => {
      const agency = agencies.find(agency => agency.id === id);
      if (agency) {
        names.push(agency.name);
      }
    });
    return names;
  };

  const getSelectedCustomersNames = () => {
    const names = [];
    organizationsState.forEach(id => {
      const customer = organizations.find(customer => customer.id === id);
      if (customer) {
        names.push(customer.name);
      }
    });
    return names;
  };

  return (
    <>
      <div className='flex mb-5 justify-between px-[20px]'>
        <div className='border b-[#E7E7E7] max-h-[40px] py-[8px] px-[16px] rounded-md w-[350px] flex items-center'>
          {type === 'monthly' ? (
            <button className='mr-[4rem]' onClick={() => handleMonthManipulate('decrease')}>
              <icons.arrowLeft />
            </button>
          ) : (
            <button className='mr-[4rem]' onClick={() => handleYearManipulate('decrease')}>
              <icons.arrowLeft />
            </button>
          )}
          <span>
            {' '}
            <icons.calendarDotes style={{ width: '18px', height: '18px' }} />{' '}
          </span>
          <DatePicker
            selected={startDate}
            onChange={onChange}
            showMonthDropdown={false}
            showYearDropdown={true}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            dateFormat='dd/MM/yyyy'
            className='text-[12px] outline-none ml-1 mr-[2.5rem] w-[160px]'
            readOnly={type === 'year'}
          />
          <button className='relative right-3' onClick={clearFilterDatepickerData}>
            <icons.closeModal />
          </button>
          {type === 'monthly' ? (
            <button className='mr-[4rem]' onClick={() => handleMonthManipulate('increase')}>
              <icons.arrowRight />
            </button>
          ) : (
            <button className='mr-[4rem]' onClick={() => handleYearManipulate('increase')}>
              <icons.arrowRight />
            </button>
          )}
        </div>
        <div className='flex flex-col font-medium text-[12px]'>
          <div className='flex gap-2 items-center relative'>
            <p>Filters:</p>
            <div className='relative'>
              <button
                onClick={() => toggleFilters(ReportsFilters.ORGANIZATIONS)}
                className={`flex gap-1 ${
                  selectedFilter.includes(ReportsFilters.ORGANIZATIONS)
                    ? 'bg-[#4D4AEA0D] rounded-md py-2 px-3'
                    : 'py-2 px-3'
                }`}
              >
                <span>
                  {' '}
                  <icons.customerDefault style={{ width: '16px', height: '16px' }} />{' '}
                </span>
                Customer
              </button>
              {showCustomerPopup && (
                <div
                  className='w-[225px] px-5 py-2 absolute left-0 bg-[#FFFFFF] shadow-xl z-40 rounded-md'
                  ref={dropdownRef}
                >
                  <div className='border rounded border-[#F5F0F0] mb-2 flex items-center mt-1 px-2'>
                    <span className='mr-2'>
                      {' '}
                      <icons.search />{' '}
                    </span>
                    <input
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                      placeholder='Find Customer'
                      className='outline-none py-3 text-[12px] w-[200px]'
                      type='text'
                    />
                  </div>
                  <div className='overflow-y-scroll max-h-[150px]'>
                    <div className='pl-2 my-2 flex items-center'>
                      <input
                        type='checkbox'
                        checked={selectAllCustomers}
                        onChange={handleSelectAllCustomersChange}
                        className='cursor-pointer w-[20px] h-[20px] mr-3'
                      />
                      <label htmlFor='selectAllAgencies' className='text-[14px] whitespace-nowrap underline'>
                        Select all
                      </label>
                    </div>
                    {filteredOrgz.map(org => {
                      const { id, name } = org;
                      return (
                        <div key={id} className='flex flex-col pl-2 my-2'>
                          <div className='flex'>
                            <input
                              className='cursor-pointer w-5 h-5 capitalize'
                              type='checkbox'
                              checked={organizationsState.includes(id)}
                              id={id}
                              name='organization'
                              onChange={() => handleCheckboxChange(id, 'organization')}
                            />
                            <label htmlFor={id} className='ml-10 text-[14px]'>
                              {name}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleShowReportsClick(ReportsFilters.ORGANIZATIONS)}
                    className='px-[16px] my-2 py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[188px] text-[14px] text-[#fff] disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={organizationsState.length === 0}
                  >
                    Show Report
                  </button>
                </div>
              )}
            </div>
            <div className='relative'>
              <button
                onClick={() => toggleFilters(ReportsFilters.AGENCY)}
                className={`flex gap-1 ${
                  selectedFilter.includes(ReportsFilters.AGENCY) ? 'bg-[#4D4AEA0D] rounded-md py-2 px-3' : 'py-2 px-3'
                }`}
              >
                <span>
                  {' '}
                  <icons.orgz style={{ width: '16px', height: '16px' }} />{' '}
                </span>{' '}
                Agency
              </button>
              {showAgencyPopup && (
                <div
                  className='w-[225px] px-5 py-2 absolute left-0 bg-[#FFFFFF] shadow-xl z-40 rounded-md'
                  ref={dropdownRef}
                >
                  <div className='border rounded border-[#F5F0F0] mb-2 flex items-center mt-1 px-2'>
                    <span className='mr-2'>
                      {' '}
                      <icons.search />{' '}
                    </span>
                    <input
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                      placeholder='Find Agency'
                      className='outline-none py-3 text-[12px] w-[200px]'
                      type='text'
                    />
                  </div>
                  <div className='overflow-y-scroll max-h-[150px]'>
                    <div className='pl-2 my-2 flex items-center'>
                      <input
                        type='checkbox'
                        checked={selectAllAgencies}
                        onChange={handleSelectAllAgenciesChange}
                        className='cursor-pointer w-[20px] h-[20px] mr-3'
                      />
                      <label htmlFor='selectAllAgencies' className='text-[14px] whitespace-nowrap underline'>
                        Select all
                      </label>
                    </div>
                    {/*<div className="pl-2 my-2 flex items-center">*/}
                    {/*  <input*/}
                    {/*    id="itsoft"*/}
                    {/*    type="checkbox"*/}
                    {/*    className="cursor-pointer w-[20px] h-[20px] mr-3"*/}
                    {/*    onChange={() => handleCheckboxChange('itsoft', 'agency')}*/}
                    {/*  />*/}
                    {/*  <label htmlFor="itsoft" className="text-[14px] whitespace-nowrap">ITSoft</label>*/}
                    {/*</div>*/}
                    {filteredAgencies.map(agency => {
                      const { id, name } = agency;
                      return (
                        <div key={id} className='flex flex-col pl-2 my-2 overflow-x-scroll'>
                          <div className='flex'>
                            <input
                              className='cursor-pointer w-[20px] h-[20px] mr-3'
                              type='checkbox'
                              checked={agenciesState.includes(id)}
                              id={id}
                              name='agency'
                              onChange={() => handleCheckboxChange(id, 'agency')}
                            />
                            <label htmlFor={id} className='text-[14px] whitespace-nowrap'>
                              {name}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleShowReportsClick(ReportsFilters.AGENCY)}
                    className='px-[16px] my-2 py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[188px] text-[14px] text-[#fff] disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={agenciesState.length === 0}
                  >
                    Show Report
                  </button>
                </div>
              )}
            </div>
            <div className='relative'>
              <button
                onClick={() => toggleFilters(ReportsFilters.TALENT)}
                className={`flex gap-1 ${
                  selectedFilter.includes(ReportsFilters.TALENT) ? 'bg-[#4D4AEA0D] rounded-md py-2 px-3' : 'py-2 px-3'
                }`}
              >
                <span>
                  {' '}
                  <icons.userDark style={{ width: '16px', height: '16px' }} />{' '}
                </span>
                By Employee
              </button>
              {showEmployeePopup && (
                <div
                  className='w-[225px] px-5 py-2 absolute left-0 bg-[#FFFFFF] shadow-xl z-40 rounded-md'
                  ref={dropdownRef}
                >
                  <div className='border rounded border-[#F5F0F0] mb-2 flex items-center mt-1 px-2'>
                    <span className='mr-2'>
                      {' '}
                      <icons.search />{' '}
                    </span>
                    <input
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                      placeholder='Find Employee'
                      className='outline-none py-3 text-[12px] w-[200px]'
                      type='text'
                    />
                  </div>
                  <div className='overflow-y-scroll max-h-[150px]'>
                    <div className='pl-2 my-2 flex items-center'>
                      <input
                        type='checkbox'
                        checked={selectAllTalents}
                        onChange={handleSelectAllTalentsChange}
                        className='cursor-pointer w-[20px] h-[20px] mr-3'
                      />
                      <label htmlFor='selectAllAgencies' className='text-[14px] whitespace-nowrap underline'>
                        Select all
                      </label>
                    </div>
                    {filteredTalents.map(talent => {
                      const { id, fullName } = talent;
                      return (
                        <div key={id} className='flex flex-col pl-2 my-2'>
                          <div className='flex'>
                            <input
                              className='cursor-pointer w-5 h-5 capitalize'
                              type='checkbox'
                              checked={talentState.includes(id)}
                              id={id}
                              name='talent'
                              onChange={() => handleCheckboxChange(id, 'employee')}
                            />
                            <label htmlFor={id} className='ml-10 text-[14px]'>
                              {fullName}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleShowReportsClick(ReportsFilters.TALENT)}
                    className='px-[16px] my-2 py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[188px] text-[14px] text-[#fff] disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={talentState.length === 0}
                  >
                    Show Report
                  </button>
                </div>
              )}
            </div>
            <button
              disabled={!startDate || !endDate}
              className='text-[#fff] bg-[#4D4AEA] px-[45px] py-1.5 rounded-md disabled:opacity-40 disabled:cursor-not-allowed'
              onClick={() => handleFetchDataClick(type)}
            >
              Show Report
            </button>
          </div>
          {reportRecords.length && selectedFilter.length ? (
            <div className="flex flex-col">
              <div className='flex justify-start mt-2.5 items-center overflow-x-scroll'>
                {agenciesState.length}
                {agenciesState.length && selectedFilter.includes(ReportsFilters.AGENCY) ? (
                  <div className='flex whitespace-nowrap'>
                    Filtered by Agency:{' '}
                    <span className='mx-2'>
                      {' '}
                      <icons.orgz style={{ width: '16px', height: '16px' }} />
                    </span>
                    <div className='flex items-center max-w-[100px] whitespace-nowrap'>
                      {getSelectedAgenciesNames().map((agency, index) => (
                        <div key={index} className='border border-gray-400 mr-2 mb-1 px-2 rounded-md drop-shadow'>
                          <span>{agency}</span>
                          <span className='text-blue-500'>
                            ({reportRecords.filter(record => record.agency.name === agency).length})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className='flex justify-start mt-2.5 items-center overflow-x-scroll'>
                {organizations.length}
                {organizationsState.length && selectedFilter.includes(ReportsFilters.ORGANIZATIONS) ? (
                  <div className='flex whitespace-nowrap'>
                    Filtered by Customers:{' '}
                    <span className='mx-2'>
                      {' '}
                      <icons.customerDefault style={{ width: '16px', height: '16px' }} />{' '}
                    </span>
                    <div className='flex items-center  max-w-[100px] whitespace-nowrap'>
                      {getSelectedCustomersNames().map((customer, index) => (
                        <div key={index} className='border border-gray-400 mr-2 mb-1 px-2 rounded-md drop-shadow'>
                          <span>{customer}</span>
                          <span className='text-blue-500'>
                            ({reportRecords.filter(record => record.customers.some(c => c.name === customer)).length})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className='flex justify-start mt-2.5 items-center overflow-x-scroll'>
                {talentState.length}
                {talentState.length && selectedFilter.includes(ReportsFilters.TALENT) ? (
                  <div className='flex whitespace-nowrap'>
                    Filtered by Employee:{' '}
                    <span className='mx-2'>
                      {' '}
                      <icons.userDark style={{ width: '16px', height: '16px' }} />{' '}
                    </span>
                    <div className='flex items-center max-w-[100px] whitespace-nowrap'>
                      {talentState.map((talentId, index) => {
                        const talent = aggregatedTalents.find(t => t.id === talentId);
                        return (
                          <div key={index} className='border border-gray-400 mr-2 mb-1 px-2 rounded-md drop-shadow'>
                            <span>{talent ? talent.fullName : 'Unknown'}</span>
                            <span className='text-blue-500'>
                              ({reportRecords.filter(record => record.talentId === talentId).length})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <div>
          <button
            disabled={!reportRecords.length}
            onClick={() => {
              exportAllTablesToExcel();
            }}
            className='text-[#4D4AEA] w-[150px] disabled:cursor-not-allowed disabled:opacity-50 text-[12px] flex items-center justify-between font-medium py-[8px] px-[16px]'
          >
            <span>
              {' '}
              <icons.downloadIcon />{' '}
            </span>{' '}
            Download excel
          </button>
        </div>
      </div>
      {loading && <PageStartLoader />}
      {!reportRecords.length && !loading && (
        <p className='font-medium whitespace-nowrap py-1'> No records loaded or found. Chose correct your filters </p>
      )}
      {!loading && (
        <>
          {reportRecords.map((record, index) => {
            if (record.usedByType) {
              return (
                <LeavesTable
                  key={index}
                  record={record}
                  startDate={startDate}
                  endDate={endDate}
                  daysArray={daysArray}
                  loading={loading}
                  filterType={selectedFilter}
                />
              );
            }
            return (
              <AnnualSituationTable
                key={index}
                record={record}
                startDate={startDate}
                currentYear={currentYear}
                endDate={endDate}
                monthsArray={monthsArray}
                loading={loading}
                filterType={selectedFilter}
              />
            );
          })}
        </>
      )}
    </>
  );
};

export default forwardRef(LeavesAndAnnualSituation);
