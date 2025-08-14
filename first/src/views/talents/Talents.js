import React, { useEffect, useLayoutEffect, useState } from 'react';
import EditTalentModal from './EditTalentModal';
import { useDispatch, useSelector } from 'react-redux';
import './talents.scss';
import history from '../../utils/browserHistory';
import { get } from 'lodash';
import sortArr from '../../utils/sortArr';
import moment from 'moment/moment';
import icons from '../../icons';
import ConfirmModal from './confirm-modal';
import CreateTalentModal from './create-talent-modal';
import PageStartLoader from '../loaders/PageStartLoader';
import { exportEmployeesTable } from '../../utils/exportToExcel';
import { generateTableHeaders, generateTableData } from './excelHelper';
import SortButton from '../components/sortButton/SortButton';
import { Checked, NotChecked } from '../components/Checkboxes';
import { FilterWidget } from './FilterWidget';
import axios from 'axios';
import { updateSingleAggregatedTalent } from '../../store/actionCreator';
import { showNotificationSuccess } from '../../utils/notifications';
import { objectToFormData } from '../../utils/objectToFormData';
import GenericModal from '../components/modal/GenericModal';
import { globalVacationHistoryPush } from '../../store/actionCreator';

const Talents = ({ API_URL }) => {
  const { aggregatedTalents, organizations, customers, agencies } = useSelector(state => state);
  const { codeToCountry = {} } = useSelector(state => state.countries);
  const [editTalentId, setEditTalentId] = useState();
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('created ASC');
  // const [page, setPage] = useState(1)
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [talentToDelete, setTalentToDelete] = useState(null);
  const [createTalentModal, setCreateTalentModal] = useState(false);
  // const [showTooltip, setShowTooltip] = useState(false);
  const [showInactiveConfirm, setShowInactiveConfirm] = useState(false);
  const [talentToToggleInactive, setTalentToToggleInactive] = useState(null);
  const getRelevantTalent = id => {
    return aggregatedTalents.find(cus => +cus.id === +id) || {};
  };
  const findAgencyNameById = id => {
    const agencyName = agencies.find(agency => agency.id === id);
    return agencyName ? agencyName.name : null;
  };
  const handleDeleteIconClick = talent => {
    setIsConfirmModalVisible(true);
    setTalentToDelete(talent);
  };

  const getRelevantOrganization = id => {
    return organizations.find(org => +org.id === +id);
  };
  const getRelevantCustomer = id => {
    return customers.find(cus => cus.id === id) || {};
  };

  const filteredTalents = filter
    ? aggregatedTalents.filter(tal => {
        const { location, fullName, email, cusIds, projectName, agencyId, summary } = tal || {};
        const agencyName = findAgencyNameById(agencyId);
        const country = codeToCountry[location] || '';

        if (
          (fullName && fullName.toLocaleLowerCase().includes(filter.toLocaleLowerCase())) ||
          country.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
          (email && email.toLocaleLowerCase().includes(filter.toLocaleLowerCase())) ||
          (projectName && projectName.toLocaleLowerCase().includes(filter.toLocaleLowerCase())) ||
          (agencyName && agencyName.toLocaleLowerCase().includes(filter.toLocaleLowerCase())) ||
          (summary && summary.toLocaleLowerCase().includes(filter.toLocaleLowerCase()))
        ) {
          return true;
        }

        for (const cusId of cusIds || []) {
          const { organizationId, fullName } = getRelevantCustomer(cusId) || {};
          const { name } = getRelevantOrganization(organizationId) || {};
          if (
            name &&
            (name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
              (fullName && fullName.toLocaleLowerCase().includes(filter.toLocaleLowerCase())))
          ) {
            return true;
          }
        }
        return false;
      })
    : aggregatedTalents;
  const [canWorkOnTwoPositionsValues, setCanWorkOnTwoPositionsValues] = useState([true, false]);
  const [inactiveValues, setInactiveValues] = useState([false]);
  const [ignoreValues, setIgnoreValues] = useState([false, true]);
  const [linkedinProfileCheckedValues, setLinkedinProfileCheckedValues] = useState([true, false]);
  const sortedTalents = sortArr(filteredTalents, sortBy).filter(item => {
    const canWorkOnTwoPositionsFilter =
      typeof item.canWorkOnTwoPositions === 'boolean'
        ? canWorkOnTwoPositionsValues.includes(item.canWorkOnTwoPositions)
        : true;

    const inactiveFilter = typeof item.inactive === 'boolean' ? inactiveValues.includes(item.inactive) : true;

    const ignoreFilter = typeof item.ignoreLinkedinCheck === 'boolean' ? ignoreValues.includes(item.ignoreLinkedinCheck) : true;

    const linkedinProfileCheckedFilter =
      typeof item.linkedinProfileChecked === 'boolean'
        ? linkedinProfileCheckedValues.includes(item.linkedinProfileChecked)
        : true;

    return canWorkOnTwoPositionsFilter && inactiveFilter && linkedinProfileCheckedFilter && ignoreFilter;
  });

  const isTalentNotFound = !sortedTalents.length && filteredTalents.length;

  useLayoutEffect(() => {
    const { id } = get(history, 'location.state') || {};
    if (id) setEditTalentId(id);
    history.replace();
  }, []);

  const data = { agencies, organizations, customers };
  const tableData = generateTableData(sortedTalents, data);
  const tableHeaders = generateTableHeaders();
  const combinedData = [tableHeaders, ...tableData];

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseVacationHistory = await axios.get(`${API_URL}/vacation/approvedList`);
        dispatch(globalVacationHistoryPush(responseVacationHistory.data));
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <span className='w-[24px] h-[24px]'>
            <icons.employee />
          </span>
          <p className='text-[#333] text-[24px] font-semibold leading-9 ml-3'>Employees</p>
        </div>
      </div>
      <div className='bg-[#FFF] mt-5 h-fit shadow-md rounded-lg py-[35px] px-[10px]'>
        <div className='flex items-center mb-5 justify-between px-[20px]'>
          <div className='flex gap-2'>
            <div className='border b-[#E7E7E7] py-[8px] px-[16px] rounded-md w-[300px] flex items-center h-[36px]'>
              <span>
                {' '}
                <icons.search />{' '}
              </span>
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder='Search'
                className='outline-none ml-2.5 text-[12px] w-[200px]'
                type='text'
              />
            </div>
            <FilterWidget
              canWorkOnTwoPositionsValues={canWorkOnTwoPositionsValues}
              ignoreValues={ignoreValues}
              inactiveValues={inactiveValues}
              linkedinProfileCheckedValues={linkedinProfileCheckedValues}
              onApplyCanWorkOnTwoPositions={setCanWorkOnTwoPositionsValues}
              onApplyIgnoreValues={setIgnoreValues}
              onApplyInactiveValues={setInactiveValues}
              onApplyLinkedinProfileCheckedValues={setLinkedinProfileCheckedValues}
            />
          </div>
          <div className='flex'>
            <button
              onClick={() => {
                exportEmployeesTable(combinedData);
              }}
              className='text-[#4D4AEA] mr-10 w-[150px] disabled:cursor-not-allowed disabled:opacity-50 text-[12px] flex items-center justify-between font-medium py-[8px] px-[16px]'
            >
              <span>
                {' '}
                <icons.downloadIcon />{' '}
              </span>{' '}
              Download excel
            </button>
            <button
              onClick={() => setCreateTalentModal(true)}
              className='bg-[#4D4AEA] w-[160px] rounded-md flex text-[14px] text-[#FFF] items-center justify-between font-medium py-[8px] px-[16px]'
            >
              Add Employee{' '}
              <span>
                {' '}
                <icons.addUser />{' '}
              </span>
            </button>
          </div>
        </div>
        <table className='w-full text-sm text-left rtl:text-right text-gray-500' id={`employees_table`}>
          <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
            <tr>
              <th scope='col' className='px-6 py-3 font-medium'>
                №
              </th>
              <th scope='col' className='px-6 py-3 font-medium'>
                Name
                <SortButton sortBy={sortBy} setSortBy={setSortBy} />
              </th>
              <th scope='col' className='px-6 py-3 font-medium'>
                Position
              </th>
              <th scope='col' className='px-6 py-3 font-medium'>
                Agency
                <SortButton sortBy={sortBy} setSortBy={setSortBy} />
              </th>
              <th scope='col' className='px-6 py-3 font-medium'>
                Stakeholder
              </th>
              <th scope='col' className='px-6 py-3 font-medium'>
                Customers
              </th>
              <th scope='col' className='px-6 py-3 font-medium'>
                Start Date
              </th>
              <th scope='col' className='px-6 py-3 font-medium whitespace-nowrap'>
                Two Position
              </th>
              <th scope='col' className='px-6 py-3 font-medium whitespace-nowrap'>
                Summary
              </th>
              <th scope='col' className='px-6 py-3 font-medium whitespace-nowrap'>
                Linkedin Status
              </th>
              <th scope='col' className='px-6 py-3 font-medium whitespace-nowrap'>
                Ignored
              </th>
              <th scope='col' className='px-6 py-3 font-medium whitespace-nowrap'>
                Linkedin Profile
              </th>
              <th scope='col' className='px-6 py-3 font-medium whitespace-nowrap'>
                Inactive
              </th>
            </tr>
          </thead>
          <tbody className='text-[12px]'>
            {sortedTalents.length ? (
              sortedTalents.map((tal, idx) => (
                <tr key={tal.id} className='bg-white border-b border-gray-100 text-[#9197B3]'>
                  <th scope='row' className='px-6 py-4 font-medium whitespace-nowrap'>
                    {idx + 1}
                  </th>
                  <th
                    scope='row'
                    onClick={() => setEditTalentId(tal.id)}
                    className='px-6 py-4 font-medium text-[#4D4AEA] underline pointer'
                  >
                    {tal.fullName}
                  </th>
                  <th scope='row' className='px-6 py-4 font-medium'>
                    {tal.position || '-'}
                  </th>
                  <th scope='row' className='px-6 py-4 font-medium '>
                    {findAgencyNameById(tal.agencyId) || tal.agencyName}
                  </th>
                  <th scope='row' className='px-6 py-4 font-medium '>
                    {tal.cusIds && tal.cusIds.length > 0
                      ? (() => {
                          const customers = tal.cusIds.map(customerId => getRelevantCustomer(customerId).fullName);
                          return customers.map((customer, index) => (
                            <span key={index}>
                              {customer}
                              {index !== customers.length - 1 && ', '}
                            </span>
                          ));
                        })()
                      : '-'}
                  </th>
                  <th scope='row' className='px-6 py-4 font-medium '>
                    {tal.cusIds && tal.cusIds.length > 0
                      ? (() => {
                          const uniqueOrganizationNames = [
                            ...new Set(
                              tal.cusIds.map(customerId => {
                                const customer = getRelevantCustomer(customerId);
                                const orgz = getRelevantOrganization(customer.organizationId);
                                return orgz.name ? orgz.name : '-';
                              })
                            )
                          ];

                          return uniqueOrganizationNames.map((orgName, index) => (
                            <span key={index}>
                              {orgName}
                              {index !== uniqueOrganizationNames.length - 1 && ', '}
                            </span>
                          ));
                        })()
                      : '-'}
                  </th>

                  <th scope='row' className='px-6 py-4 font-medium '>
                    {tal.startDate ? moment(tal.startDate).format('DD/MM/YYYY') : '-'}
                  </th>
                  <th scope='row' className='px-6 py-4 font-medium '>
                    {typeof tal.canWorkOnTwoPositions === 'boolean' ? (
                      <>{tal.canWorkOnTwoPositions ? <Checked /> : <NotChecked />}</>
                    ) : (
                      '-'
                    )}
                  </th>
                  <th scope='row' className='px-6 py-4 font-medium '>
                    {tal.summary ? (
                      <div
                        style={{
                          maxHeight: '120px',
                          maxWidth: '350px',
                          overflowY: 'auto',
                          background: '#f8fafc',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '13px',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {tal.summary}
                      </div>
                    ) : (
                      '-'
                    )}
                  </th>
                  <th scope='row' className='px-6 py-4 font-medium '>
                    {typeof tal.linkedinProfileChecked === 'boolean' ? (
                      <>{!tal.ignoreLinkedinCheck && tal.linkedinProfileChecked ? <Checked /> : <NotChecked />}</>
                    ) : (
                      '-'
                    )}
                  </th>
                  <th scope='row' className='px-6 py-4 font-medium '>
                    {typeof tal.ignoreLinkedinCheck === 'boolean' ? (
                      <>{tal.ignoreLinkedinCheck ? <Checked /> : <NotChecked />}</>
                    ) : (
                      '-'
                    )}
                  </th>
                  <th scope='row' className='px-6 py-4 font-medium '>
                    {tal.linkedinProfile ? (
                      <a
                        target='_blank'
                        className='font-medium text-blue-600 dark:text-blue-500 hover:underline'
                        href={tal.linkedinProfile}
                      >
                        {tal.linkedinProfile}
                      </a>
                    ) : (
                      '-'
                    )}
                  </th>
                  <th scope='row' className='px-6 py-4 font-medium '>
                    {typeof tal.inactive === 'boolean' ? (
                      <div
                        onClick={async () => {
                          setTalentToToggleInactive(tal);
                          setShowInactiveConfirm(true);
                        }}
                      >
                        {tal.inactive ? (
                          <div className='inline-flex items-center'>
                            <label className={`relative flex items-center p-3 rounded-full`} htmlFor='purple'>
                              <input
                                type='checkbox'
                                className={`before:content[''] peer relative h-5 w-5 appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#4D4AEA] checked:bg-[#4D4AEA] checked:before:bg-purple-500 hover:before:opacity-10`}
                                id='purple-answered'
                                checked={true}
                              />
                              <span className='absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='h-3.5 w-3.5'
                                  viewBox='0 0 20 20'
                                  fill='currentColor'
                                  stroke='currentColor'
                                  strokeWidth='1'
                                >
                                  <path
                                    fillRule='evenodd'
                                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                    clipRule='evenodd'
                                  ></path>
                                </svg>
                              </span>
                            </label>
                          </div>
                        ) : (
                          <div className={`inline-flex items-center`}>
                            <label className={`relative flex items-center p-3 rounded-full`} htmlFor='purple'>
                              <input
                                type='checkbox'
                                className={`before:content[''] peer relative h-5 w-5 appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#4D4AEA] checked:bg-[#4D4AEA] checked:before:bg-purple-500 hover:before:opacity-10`}
                                checked={false}
                              />
                              <span className='absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='h-3.5 w-3.5'
                                  viewBox='0 0 20 20'
                                  fill='currentColor'
                                  stroke='currentColor'
                                  strokeWidth='1'
                                >
                                  <path
                                    fillRule='evenodd'
                                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                    clipRule='evenodd'
                                  ></path>
                                </svg>
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </th>
                  <td scope='row' className='px-6 py-4 font-medium'>
                    <button onClick={() => handleDeleteIconClick(tal)}>
                      <icons.deleteIcon />
                    </button>
                  </td>
                </tr>
              ))
            ) : isTalentNotFound ? null : (
              <PageStartLoader />
            )}
          </tbody>
        </table>
        {/*<div className="flex justify-between items-center px-10 pt-10">*/}
        {/*    <button*/}
        {/*      className="px-[16px] py-[8px] border-[#E0E0E0] border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"*/}
        {/*      onClick={() => setPage(page - 1)}*/}
        {/*      // disabled={vacationHistory.currentPage === 1}*/}
        {/*    >*/}
        {/*        <span className="text-[14px] text-[#2A2A2A] text-center font-medium">Previous</span>*/}
        {/*    </button>*/}
        {/*    <p className="text-[14px] font-medium text-[#2A2A2A]">Page 1 of 1</p>*/}
        {/*    <button*/}
        {/*      className="px-[16px] py-[8px] border-[#E0E0E0] border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"*/}
        {/*      onClick={() => setPage(page + 1)}*/}
        {/*      // disabled={vacationHistory.currentPage === vacationHistory.totalPages}*/}
        {/*    >*/}
        {/*        <span className="text-[14px] text-[#2A2A2A] text-center font-medium">Next</span>*/}
        {/*    </button>*/}
        {/*</div>*/}
      </div>
      {!!createTalentModal && (
        <CreateTalentModal
          agencies={agencies}
          displayModal={!!createTalentModal}
          closeModal={() => setCreateTalentModal(false)}
          API_URL={API_URL}
          getRelevantCustomer={getRelevantCustomer}
          getRelevantOrganization={getRelevantOrganization}
          customers={customers}
        />
      )}
      {!!editTalentId && (
        <EditTalentModal
          agencies={agencies}
          displayModal={!!editTalentId}
          closeModal={() => setEditTalentId()}
          talentToEdit={getRelevantTalent(editTalentId)}
          getRelevantCustomer={getRelevantCustomer}
          customers={customers}
          getRelevantOrganization={getRelevantOrganization}
          API_URL={API_URL}
        />
      )}
      {!!isConfirmModalVisible && (
        <ConfirmModal
          isTalent={true}
          talentData={talentToDelete}
          API_URL={API_URL}
          isVisible={isConfirmModalVisible}
          onClose={() => setIsConfirmModalVisible(false)}
        />
      )}
      {showInactiveConfirm && (
        <GenericModal displayModal={showInactiveConfirm} closeModal={() => setShowInactiveConfirm(false)}>
          <div className='p-6'>
            <h2 className='text-lg font-semibold mb-4'>Confirm Inactivation</h2>
            <p>
              Are you sure you want to mark this talent as {talentToToggleInactive?.inactive ? 'active' : 'inactive'}?
            </p>
            <div className='flex justify-end gap-4 mt-6'>
              <button className='px-4 py-2 bg-gray-200 rounded' onClick={() => setShowInactiveConfirm(false)}>
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-[#4D4AEA] text-white rounded'
                onClick={async () => {
                  const prevData = talentToToggleInactive;
                  const newData = { ...talentToToggleInactive, inactive: !talentToToggleInactive.inactive };
                  dispatch(updateSingleAggregatedTalent(newData));
                  const formData = objectToFormData(newData);
                  try {
                    await axios.put(`${API_URL}/talent`, formData);
                    showNotificationSuccess('Updated successfully.');
                  } catch {
                    dispatch(updateSingleAggregatedTalent(prevData));
                  }
                  setShowInactiveConfirm(false);
                  setTalentToToggleInactive(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  );
};

export default Talents;
