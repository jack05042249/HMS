import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { updateSingleCustomer } from '../../store/actionCreator';
import { handleError } from '../../utils/handleError';
import history from '../../utils/browserHistory';
import GenericModal from '../components/modal/GenericModal';
import { get, startCase } from 'lodash';
import { getValuesFromElement } from '../../utils/getValuesFromElement';
import { showNotificationSuccess } from '../../utils/notifications';

import moment from 'moment';
import sortArr from '../../utils/sortArr';
import icons from '../../icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ConfirmModal from '../talents/confirm-modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SmallLoader from '../loaders/SmallLoader';
import { useEditStakeholderTabs } from '../../utils';
import { ObjectTasks } from '../tasks/ObjectTasks';
import { Checked, NotChecked } from '../components/Checkboxes';
import { FilterWidget } from './FilterWidget';

const Stakeholders = ({ API_URL }) => {
  const { customers, organizations } = useSelector(state => state);
  const { codeToCountry = {} } = useSelector(state => state.countries);

  const [error, setError] = useState('');
  const [editCustomerId, setEditCustomerId] = useState();
  const [massEmailModal, setMassEmailModal] = useState();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name ASC');
  const [birthdayDate, setBirthdayDate] = useState(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState();
  const [isFileSelected, setIsFileSelected] = useState(false);
  const initValues = {
    subject: '',
    img: null
  };

  const [text, setText] = useState(``);
  const initState = { values: initValues };
  const [formState, setFormState] = useState(initState);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [editNumberMode, setEditNumberMode] = useState(true);
  const [isEmailProcessed, setIsEmailProcessed] = useState(false);

  const handleDeleteIconClick = customer => {
    setIsConfirmModalVisible(true);
    setCustomerToDelete(customer);
  };

  useLayoutEffect(() => {
    const { id } = get(history, 'location.state') || {};
    if (id) {
      setEditCustomerId(id);
    }
    history.replace();
  }, []);

  const handleBirthdayChange = date => {
    if (date) {
      setBirthdayDate(date);
      setFormState(prevState => ({
        ...prevState,
        values: {
          ...prevState.values,
          birthday: moment(date).format('YYYY-MM-DD')
        }
      }));
    } else {
      setBirthdayDate(null);
      setFormState(prevState => ({
        ...prevState,
        values: {
          ...prevState.values,
          birthday: null
        }
      }));
    }
  };

  useEffect(() => {
    if (editCustomerId) {
      const relevantCustomer = getRelevantCustomer(editCustomerId);
      if (relevantCustomer && relevantCustomer.birthday && relevantCustomer.birthday !== '0000-00-00') {
        setBirthdayDate(new Date(relevantCustomer.birthday));
      }
    }
  }, [editCustomerId]);

  const getRelevantOrganization = id => {
    return organizations.find(org => org.id === id) || {};
  };

  const filteredCustomers = filter
    ? customers.filter(cus => {
        const { location, fullName, email, mobile, organizationId } = cus;
        const country = codeToCountry[location];
        if (
          fullName.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
          country.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
          email.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
          mobile.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
          getRelevantOrganization(+organizationId).name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
        ) {
          return true;
        }
        return false;
      })
    : customers;

  const [inactiveValues, setInactiveValues] = useState([false]);

  const sortedCustomers = sortArr(filteredCustomers, sortBy).filter(item => {
    const inactiveFilter = typeof item.inactive === 'boolean' ? inactiveValues.includes(item.inactive) : true;
    return inactiveFilter;
  });

  const getRelevantCustomer = id => {
    return customers.find(cus => cus.id === id);
  };
  const removeError = () => {
    if (error) setError('');
  };

  const closeModal = () => {
    removeError();
    setEditNumberMode(true);
    setEditCustomerId();
    setMassEmailModal();
    setBirthdayDate();
    setText('');
    setIsFileSelected(false);
    setIsEmailProcessed(false);
  };

  const handleCustomer = async () => {
    try {
      removeError();
      setLoading(true);
      const { data } = getValuesFromElement('single_customer');
      const fieldsToCheck = ['fullName', 'email'];

      for (const key of fieldsToCheck) {
        if (fieldsToCheck.includes(key)) {
          const value = data[key]?.trim();
          if (!value) {
            setError(`${startCase(key)} cannot be empty`);
            setLoading(false);
            return;
          }
        }
      }

      if (typeof data.organizationId === 'string') {
        data.organizationId = parseInt(data.organizationId);
      }
      data.birthday = birthdayDate ? moment(birthdayDate).format('YYYY-MM-DD') : '0000-00-00';
      const isNew = editCustomerId < 0;
      if (isNew) {
        const {
          data: { savedCustomer }
        } = await axios.post(`${API_URL}/customer`, data);
        dispatch(updateSingleCustomer(savedCustomer));
        showNotificationSuccess('Customer added successfully');
        closeModal();
        setLoading(false);
        return;
      }
      data.id = editCustomerId;
      const { status } = await axios.put(`${API_URL}/customer`, data);
      if (status === 204) {
        const inactive = getRelevantCustomer(editCustomerId)?.inactive;
        dispatch(updateSingleCustomer({ ...data, inactive }));
        showNotificationSuccess('Customer updated successfully');
        setLoading(false);
        closeModal();
      }
    } catch (error) {
      setLoading(false);
      setError(error?.response?.data || 'Something went wrong');
      handleError(error, dispatch, history);
    }
  };
  const { values } = formState;
  const handleChangeForm = ({ target }) => {
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [target.name]: target.value
      }
    }));
    if (target.type === 'file') {
      setIsFileSelected(!!target.value);
    }
  };

  const handleSendMail = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      if (!values.subject) {
        setError('Subject is required');
        setLoading(false);
        return;
      }
      if (!text && !isFileSelected) {
        setError('Mail text or attachment required');
        setLoading(false);
        return;
      }

      closeModal();
      showNotificationSuccess('The mailing has started. You will be notified when it is finished');
      data.append('subject', values.subject);
      data.append('text', text);
      const imgInput = document.getElementById('img');
      if (imgInput.files.length > 0) {
        data.append('img', imgInput.files[0]);
      }
      setIsEmailProcessed(true);
      const response = await axios.post(`${API_URL}/customer/massEmail`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 204) {
        showNotificationSuccess('Mail was send to all stakeholders');
        setLoading(false);
        setIsEmailProcessed(false);
        setIsFileSelected(false);
        setFormState({
          values: {
            subject: '',
            img: null
          }
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Error sending mail:', error);
    }
  };

  const onMassEmailProcessed = () => {
    return (
      <div className='relative p-4 bg-white rounded-lg shadow md:p-8 max-w-[700px] flex flex-col items-center justify-center'>
        <div className='mb-4 text-gray-500'>
          <h3 className='mb-3 text-lg flex justify-center items-center font-medium text-gray-900'>
            Mails are currently being sent to Stakeholders{' '}
            <span>
              {' '}
              <icons.sendMail style={{ width: '22px', height: '22px', marginLeft: '5px' }} />{' '}
            </span>
          </h3>
          <p className='font-normal text-gray-800 text-m mb-2'>
            If you see this notification, the sending has started. This process will take some time
          </p>
          <p className='font-normal text-gray-800 text-m'>
            You can close this window, and a notification will be shown to you when the mailing is complete.
            <span className='underline'>Also this window will be closed after mass email request is done.</span>
          </p>
        </div>
        <div className='justify-center items-center'>
          <button
            onClick={() => closeModal()}
            id='close-modal'
            type='button'
            className='px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[160px] text-[18px] text-[#fff] flex justify-center gap-2'
          >
            Got it!{' '}
            <span>
              {' '}
              <icons.feedbackHeart style={{ stroke: 'white', strokeWidth: 2 }} />{' '}
            </span>
          </button>
        </div>
      </div>
    );
  };
  const renderMassEmailModal = () => {
    return (
      <div className='w-[900px] px-7 flex justify-start flex-col text-left'>
        <div className='flex justify-between items-center border-b border-[#9197B333] pb-4 mb-7'>
          <h1 className='text-left text-[20px] font-medium'>Mass E-mail</h1>
          <p className='text-[14px] py-2 px-4 font-medium bg-[#4D4AEA0D] rounded-md'>New Email</p>
        </div>
        <div className='flex flex-col mb-2'>
          <span className='text-[#000] text-[14px] font-medium text-left'>To</span>
          <p className='w-100 bg-[#FAFCFE] text-[12px] text-[#33333380] px-4 py-2'>All Partner Stakeholders</p>
        </div>
        <form onSubmit={e => e.preventDefault()} encType='multipart/form-data'>
          <div className='flex flex-col mb-2'>
            <div className='flex flex-col'>
              <label className='text-[#000] text-[14px] font-medium text-left' htmlFor='subject'>
                Subject
              </label>
              <input
                type='text'
                name='subject'
                className='border border-[#F5F0F0] mb-4 text-[12px] w-100 rounded-lg h-[40px] px-[15px] appearance-none outline-none'
                value={values.subject}
                onChange={handleChangeForm}
                id='subject'
                placeholder='Hello all'
              />
            </div>
          </div>
          <div className='flex flex-col mb-2'>
            <label className='text-[#000] text-[14px] font-medium text-left' htmlFor='text'>
              Email content
            </label>
            <ReactQuill
              theme='snow'
              value={text}
              id='text'
              name='text'
              className='w-100 h-[215px] pb-10 resize-none outline-none text-[12px]'
              onChange={setText}
            />
          </div>
          {error && (
            <span className='text-[#D0004B] mt-2 left-[350px] bottom-7 absolute max-w-[260px] text-[12px] flex text-left items-center'>
              <span className='mr-[5px]'>
                {' '}
                <icons.alert />{' '}
              </span>{' '}
              {error}
            </span>
          )}
          <div className='flex justify-between'>
            <div className='flex flex-col'>
              <label className='text-[#000] text-[14px] font-medium text-left' htmlFor='img'>
                Attach a file
              </label>
              <div className='flex relative'>
                <input
                  type='file'
                  className='text-sm text-stone-400
   file:mr-3 file:py-2 file:px-5 file:rounded-md
   file:text-xs file:font-normal
   file:bg-[#4D4AEA] file:text-[#fff]
   hover:file:cursor-pointer file:border-none file:outline-none'
                  id='img'
                  name='img'
                  accept='image/png, image/gif, image/jpeg'
                  value={formState.img}
                  onChange={handleChangeForm}
                />
                {isFileSelected && (
                  <button
                    onClick={() => {
                      const input = document.getElementById('img');
                      if (input) {
                        input.value = '';
                      }
                      setIsFileSelected(false);
                    }}
                    className='text-3xl text-[#4D4AEA] absolute right-[305px]'
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
            <div className='flex items-center justify-end mt-3'>
              <button
                onClick={() => closeModal()}
                className='w-[145px] px-[16px] mr-2.5 py-[8px] border-[#E0E0E0] border rounded-md font-medium text-[#020202] text-[14px]'
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendMail()}
                className='px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[160px] text-[14px] text-[#fff]'
              >
                {loading ? <SmallLoader tiny /> : 'Send Now'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  const { activeTab, setActiveTab, tabs } = useEditStakeholderTabs();

  const isPersonalDetailsActive = activeTab === tabs[0];
  const isTasksActive = activeTab === tabs[1];

  const renderSingleCustomer = () => {
    const relevantCustomer = getRelevantCustomer(editCustomerId) || {};

    const { id, fullName, email, organizationId, birthday, location, mobile } = relevantCustomer;
    return (
      <div className='pl-5 relative' id='single_customer'>
        <div className='flex justify-between items-center mb-5 pr-5 border-b border-[#9197B333] pb-8'>
          <div className='flex text-[#333] text-[20px] font-medium mt-2'>
            <span className='mr-3'> {fullName ? <icons.userEditIcon /> : <icons.addUserGray />} </span>
            {isTasksActive ? (
              <>{fullName ? `${fullName}'s Tasks` : 'Stakeholder Tasks'}</>
            ) : (
              <>{fullName ? `Edit ${fullName}` : 'Add stakeholder'}</>
            )}
          </div>
          <div className='flex items-center font-medium text-[#333] text-[14px]'>
            {tabs.map(tab => {
              const isTabActive = tab === activeTab;
              return (
                <button
                  className={`${isTabActive ? 'bg-gray-100 rounded-md py-2 px-6' : 'py-2 px-6'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
        <div className='mt-[1.5rem]'>
          {isPersonalDetailsActive && (
            <>
              <form className='flex'>
                <div className='flex flex-col mr-5'>
                  <label htmlFor='fullName' className='text-[#000] text-[14px] font-medium text-left'>
                    Full Name
                  </label>
                  <span className='relative left-[280px] top-[25px] pointer-events-none'>
                    {' '}
                    <span> {fullName ? <icons.editIcon /> : null} </span>{' '}
                  </span>
                  <input
                    id='fullName'
                    type='text'
                    name='fullName'
                    defaultValue={fullName}
                    placeholder='Iris'
                    className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
                  />
                  <label htmlFor='organizationId' className='text-[#000] text-[14px] font-medium text-left'>
                    {' '}
                    Customer{' '}
                  </label>
                  <span className='relative left-[280px] top-[24px] pointer-events-none'>
                    {' '}
                    <icons.selectIcon />{' '}
                  </span>
                  <select
                    className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
                    id='organizationId'
                    defaultValue={organizationId}
                  >
                    {organizations.map(org => {
                      const { id, name } = org;
                      return (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor='email' className='text-[#000] text-[14px] font-medium text-left'>
                    E-mail
                  </label>
                  <span className='relative left-[280px] top-[25px] pointer-events-none'>
                    {' '}
                    <span> {fullName ? <icons.editIcon /> : null} </span>{' '}
                  </span>
                  <input
                    id='email'
                    type='email'
                    name='email'
                    defaultValue={email}
                    placeholder='iris@gmail.com'
                    className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
                  />
                </div>
                <div className='flex flex-col mr-10'>
                  <label htmlFor='mobile' className='text-[#000] text-[14px] font-medium text-left'>
                    Mobile Phone
                  </label>
                  <span
                    onClick={() => setEditNumberMode(!editNumberMode)}
                    className={
                      editNumberMode
                        ? `relative left-[280px] top-[25px] cursor-pointer`
                        : `relative left-[280px] top-[25px] cursor-pointer`
                    }
                  >
                    {' '}
                    <span>
                      {' '}
                      {fullName ? (
                        <icons.editIcon style={editNumberMode && mobile ? { fill: '#4D4AEA' } : null} />
                      ) : null}{' '}
                    </span>{' '}
                  </span>
                  {editNumberMode && mobile ? (
                    <div className='border border-[#F5F0F0] mb-4 w-[313px] rounded-lg h-[40px] px-[15px] flex justify-start items-center'>
                      <a
                        href={`https://wa.me/${mobile}`}
                        target='_blank'
                        className='appearance-none outline-none cursor-pointer font-medium whitespace-nowrap text-[16px] text-[#4D4AEA] underline'
                      >
                        {' '}
                        {mobile}{' '}
                      </a>
                    </div>
                  ) : (
                    <input
                      id='mobile'
                      type='text'
                      name='mobile'
                      defaultValue={mobile}
                      placeholder='Phone number'
                      className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
                    />
                  )}
                  <label htmlFor='location' className='text-[#000] text-[14px] font-medium text-left'>
                    Location
                  </label>
                  <span className='relative left-[280px] top-[24px] pointer-events-none'>
                    {' '}
                    <icons.selectIcon />{' '}
                  </span>
                  <select
                    id='location'
                    name='location'
                    className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
                    defaultValue={location}
                  >
                    {Object.entries(codeToCountry).map(([code, countryName]) => {
                      return (
                        <option value={code} key={code}>
                          {countryName}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor='birthday' className='text-[#000] text-[14px] font-medium text-left'>
                    Birthday
                  </label>
                  <span className='relative left-[280px] top-[25px] pointer-events-none'>
                    {' '}
                    <span> {fullName ? <icons.editIcon /> : null} </span>{' '}
                  </span>
                  <DatePicker
                    id='birthday'
                    name='birthday'
                    showMonthDropdown
                    showYearDropdown
                    selected={birthdayDate ?? undefined}
                    onChange={date => handleBirthdayChange(date)}
                    selectsStart
                    placeholderText={'DD/MM/YYYY'}
                    dateFormat='dd/MM/yyyy'
                    className='border border-[#F5F0F0] w-[313px] mb-4 rounded-lg text-[#9197B3] h-[40px] px-[15px] outline-none'
                  />
                </div>
              </form>
              <div className='flex items-center mr-9 justify-end'>
                <button
                  onClick={() => closeModal()}
                  className='w-[145px] px-[16px] mr-2.5 py-[8px] border-[#E0E0E0] border rounded-md font-medium text-[#020202] text-[14px]'
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCustomer()}
                  className='px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[160px] text-[14px] text-[#fff]'
                >
                  {loading ? <SmallLoader tiny /> : 'Save and add'}
                </button>
              </div>
            </>
          )}
          {isTasksActive && <ObjectTasks id={id} type='customer' />}
        </div>
        {error ? (
          <span className='text-[#D0004B] absolute bottom-2 text-[12px] flex items-center'>
            <span className='mr-[5px]'>
              {' '}
              <icons.alert />{' '}
            </span>{' '}
            {error}
          </span>
        ) : (
          <span></span>
        )}
      </div>
    );
  };

  return (
    <div>
      {isEmailProcessed && (
        <GenericModal displayModal={!!isEmailProcessed} closeModal={closeModal}>
          {onMassEmailProcessed()}
        </GenericModal>
      )}
      {!!editCustomerId && (
        <GenericModal displayModal={!!editCustomerId} closeModal={closeModal}>
          {renderSingleCustomer()}
        </GenericModal>
      )}
      {!!massEmailModal && (
        <GenericModal displayModal={!!massEmailModal} closeModal={closeModal}>
          {renderMassEmailModal()}
        </GenericModal>
      )}
      <div>
        <div className='flex items-center justify-between mb-10'>
          <div className='flex items-center'>
            <span className='w-[24px] h-[24px]'>
              <icons.customerDefault />
            </span>
            <p className='text-[#333] text-[24px] font-semibold leading-9 ml-3'>Stakeholders</p>
          </div>
        </div>
        <div className='bg-[#FFF]  mt-5 h-fit shadow-md rounded-lg py-[35px] px-[20px]'>
          <div className='flex items-center mb-5 justify-between px-[20px]'>
            <div className='flex gap-5'>
              <div>
                <div className='border b-[#E7E7E7] py-[8px] px-[16px] rounded-md w-[300px] flex items-center'>
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
              </div>

              <FilterWidget inactiveValues={inactiveValues} onApplyInactiveValues={setInactiveValues} />
            </div>
            <div>
              <div className='flex'>
                <button
                  onClick={() => setMassEmailModal(-1)}
                  className='flex items-center font-normal text-[13px] w-[180px] py-[8px] px-[16px] rounded-md border border-[#4D4AEA] text-[#4D4AEA]'
                >
                  Send Mass E-Mail{' '}
                  <span className='ml-2'>
                    {' '}
                    <icons.sendMail />{' '}
                  </span>
                </button>
                <button
                  onClick={() => setEditCustomerId(-1)}
                  className='bg-[#4D4AEA] ml-3 w-[180px] rounded-md flex text-[14px] text-[#FFF] items-center justify-between font-medium py-[8px] px-[16px]'
                >
                  Add Stakeholder{' '}
                  <span>
                    {' '}
                    <icons.addUser />{' '}
                  </span>{' '}
                </button>
              </div>
            </div>
          </div>
          <table className='w-full text-sm text-left rtl:text-right text-gray-500'>
            <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
              <tr>
                <th scope='col' className='px-6 py-3 font-medium text-[#333] text-[12px]'>
                  №
                </th>
                <th scope='col' className='px-6 py-3  font-medium text-[#333] text-[12px]'>
                  Customer
                </th>
                <th scope='col' className='px-6 py-3  font-medium text-[#333] text-[12px]'>
                  Stakeholder Name
                </th>
                <th scope='col' className='px-6 py-3 font-medium text-[#333] text-[12px]'>
                  E-Mail
                </th>
                <th scope='col' className='px-6 py-3 font-medium text-[#333] text-[12px]'>
                  Mobile Phone
                </th>
                <th scope='col' className='px-6 py-3 font-medium text-[#333] text-[12px]'>
                  Location
                </th>
                <th scope='col' className='px-6 py-3 font-medium text-[#333] text-[12px]'>
                  Birthday
                </th>
                <th scope='col' className='px-6 py-3 font-medium text-[#333] text-[12px]'>
                  Inactive
                </th>
              </tr>
            </thead>
            <tbody className='text-[12px]'>
              {sortedCustomers.map((cus, idx) => {
                const { id, fullName, email, organizationId, birthday, location, mobile, inactive } = cus;
                return (
                  <tr key={id} className='bg-white border-b border-gray-100 text-[#9197B3]'>
                    <th scope='row' className='px-6 py-4 text-[12px] font-medium '>
                      {idx + 1}
                    </th>
                    <th
                      scope='row'
                      className='px-6 py-4 font-medium text-[12px] text-[#4D4AEA] underline cursor-pointer'
                      onClick={() => history.push('/organizations')}
                    >
                      {getRelevantOrganization(organizationId).name}
                    </th>
                    <th
                      onClick={() => setEditCustomerId(cus.id)}
                      scope='row'
                      className='px-6 py-4 cursor-pointer font-medium  text-[12px] text-[#4D4AEA] underline'
                    >
                      {fullName}
                    </th>
                    <th scope='row' className='px-6 py-4 font-medium text-[12px] '>
                      {email}
                    </th>
                    <th scope='row' className='px-6 py-4 font-medium text-[12px] '>
                      {mobile ? (
                        <a
                          className='px-6 py-4 cursor-pointer font-medium  text-[12px] text-[#4D4AEA] underline'
                          href={`https://wa.me/${mobile}`}
                          target='_blank'
                        >
                          {' '}
                          {mobile}{' '}
                        </a>
                      ) : (
                        '-'
                      )}
                    </th>
                    <th scope='row' className='px-6 py-4 font-medium text-[12px] '>
                      {codeToCountry[location]}
                    </th>
                    <th scope='row' className='px-6 py-4 font-medium text-[12px] '>
                      {birthday && birthday !== '0000-00-00' ? moment(birthday).format('DD/MM/YYYY') || '-' : '-'}
                    </th>
                    <th scope='row' className='px-6 py-4 font-medium '>
                      {typeof inactive === 'boolean' ? (
                        <div
                          onClick={async () => {
                            const prevData = cus;
                            const newData = { ...cus, inactive: !cus.inactive, birthday: cus.birthday || '0000-00-00' };
                            dispatch(updateSingleCustomer(newData));
                            axios
                              .put(`${API_URL}/customer`, newData)
                              .then(() => {
                                showNotificationSuccess('Updated successfully.');
                              })
                              .catch(() => {
                                dispatch(updateSingleCustomer(prevData));
                              });
                          }}
                        >
                          {cus.inactive ? (
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
                    <th scope='row' className='px-6 py-4 font-medium  relative left-[10px]'>
                      <button onClick={() => handleDeleteIconClick(cus)}>
                        <icons.deleteIcon />
                      </button>
                    </th>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/*<div className="flex justify-between items-center pt-10 px-5">*/}
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
      </div>
      {!!isConfirmModalVisible && (
        <ConfirmModal
          isTalent={false}
          customerData={customerToDelete}
          API_URL={API_URL}
          isVisible={isConfirmModalVisible}
          onClose={() => setIsConfirmModalVisible(false)}
        />
      )}
    </div>
  );
};

export default Stakeholders;
