import React, { useMemo, useState } from 'react';
import GenericModal from '../components/modal/GenericModal';
import { useDispatch, useSelector } from 'react-redux';
import { startCase } from 'lodash';
import defaultPicture from '../../icons/default_picture_circle.png';
import getBase64 from '../../utils/getBase64';
import axios from 'axios';
import { handleError } from '../../utils/handleError';
import history from '../../utils/browserHistory';
import { updateSingleAggregatedTalent } from '../../store/actionCreator';
import { showNotificationSuccess } from '../../utils/notifications';
import moment from 'moment';
import './talents.scss';
import icons from '../../icons';
import DatePicker from 'react-datepicker';
import VacationAllowance from './vacation-allowance';
import UpdatePassword from './update-password';
import SmallLoader from '../loaders/SmallLoader';
import { useEditTalentTabs } from '../../utils';
import { Feedbacks } from './Feedbacks';
import { ObjectTasks } from '../tasks/ObjectTasks';
import { SearchableField } from '../components/fields/SearchableField';
import { UploadCV } from './UploadCV';
import { objectToFormData } from '../../utils/objectToFormData';

function isValidLink(str) {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

function bufferToFile(bufferObject, fileName = 'file.pdf', mimeType = 'application/pdf') {
  const byteArray = new Uint8Array(bufferObject.data);
  const file = new File([byteArray], fileName, { type: mimeType });
  return file;
}

const EditTalentModal = ({
  displayModal,
  closeModal,
  talentToEdit,
  getRelevantCustomer,
  customers,
  getRelevantOrganization,
  API_URL,
  agencies
}) => {
  const { activeTab, setActiveTab, tabs } = useEditTalentTabs();

  const [talent, setTalent] = useState(talentToEdit);
  const [error, setError] = useState('');
  const [showCustomers, setShowCustomers] = useState(false);
  const [filter, setFilter] = useState('');
  const [isUpdatePasswordModalVisible, setIsUpdatePasswordModalVisible] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { codeToCountry } = useSelector(state => state.countries);
  const allOrganizations = useSelector(state => state.organizations);

  const isPersonalDetailsActive = activeTab === tabs[0];
  const isVacationAllowanceActive = activeTab === tabs[1];
  const isFeedbacksActive = activeTab === tabs[2];
  const isTasksActive = activeTab === tabs[3];

  const toggleResetPassword = () => {
    setIsUpdatePasswordModalVisible(!isUpdatePasswordModalVisible);
    setIsPasswordEditing(!isPasswordEditing);
  };

  const findAgencyNameById = id => {
    const agencyName = agencies.find(agency => agency.id === +id);
    return agencyName ? agencyName.name : null;
  };

  const dispatch = useDispatch();

  let {
    id,
    fullName,
    location = 'ua',
    email,
    cusIds = [],
    picture = '',
    isActive = true,
    projectName,
    position,
    removeReason,
    agencyId,
    feedbackFrequency,
    startDate,
    endDate,
    birthday,
    address,
    phoneNumber,
    password = '',
    whatsup,
    summary,
    talentMainCustomer,
    organizations,
    telegram,
    hourlyRate,
    cv,
    canWorkOnTwoPositions,
    linkedinProfileChecked,
    linkedinProfile,
    linkedinProfileDate,
    linkedinComment
  } = talent;

  const customersForMainStakeholder = customers.filter(cus => !cus.inactive && cusIds.includes(cus.id));
  const organizationIdsForMainStakeholder = customers
    .filter(cus => !cus.inactive && `${cus.id}` === `${talentMainCustomer}`)
    .map(cus => cus.organizationId);

  const customersForStakeholdersDropdown = filter
    ? customers
        .filter(cus => {
          const { fullName, organizationId } = cus;
          const { name } = getRelevantOrganization(organizationId);
          if (
            fullName.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
            name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
          ) {
            return cus;
          }
          return null;
        })
        .filter(cus => !cus.inactive || cusIds.includes(cus.id))
    : customers.filter(cus => !cus.inactive || cusIds.includes(cus.id));

  const formattedStartDate = startDate ? new Date(startDate) : null;
  const formattedEndDate = endDate ? new Date(endDate) : null;
  const formattedBirthday = birthday ? new Date(birthday) : null;
  const formattedLinkedinProfileDate = linkedinProfileDate ? new Date(linkedinProfileDate) : null;

  const toggleCustomers = () => {
    setShowCustomers(state => !state);
  };

  const removeError = () => {
    if (error) setError('');
  };

  const handleCloseModal = () => {
    removeError();
    closeModal();
  };

  const handleCheckboxChange = (customerId, event) => {
    setTalent(prev => {
      const updatedCusIds = prev.cusIds.includes(customerId)
        ? prev.cusIds.filter(id => id !== customerId)
        : [...prev.cusIds, customerId];
      return { ...prev, cusIds: updatedCusIds };
    });
  };

  const onChangeHandler = async e => {
    const { id, name, value, checked, files } = e.target;
    if (name === 'birthday') {
      setTalent(prev => ({ ...prev, birthday: value }));
      return;
    }

    if (name === 'startDate') {
      setTalent(prev => ({ ...prev, startDate: value }));
      return;
    }

    if (name === 'endDate') {
      setTalent(prev => ({ ...prev, endDate: value }));
      return;
    }

    if (name === 'linkedinProfileDate') {
      setTalent(prev => ({ ...prev, linkedinProfileDate: value }));
      return;
    }

    if (name === 'picture') {
      const [file] = files;
      if (file) {
        removeError();
        if (file.size > 300000) {
          setError('File size should be less then 300 kb');
          return;
        }
        const imgArea = document.getElementById('profile_picture');
        const b64 = await getBase64(file);
        imgArea.src = b64;
        setTalent(prev => ({ ...prev, picture: b64 }));
      }
      return;
    }
    if (id === 'isActive' || id === 'hourlyRate' || id === 'canWorkOnTwoPositions' || id === 'linkedinProfileChecked') {
      setTalent(prev => ({ ...prev, [id]: checked }));
      return;
    }
    setTalent(prev => ({ ...prev, [id]: value, isChecked: checked }));
  };

  const saveDetails = async sendMailFrequency => {
    try {
      removeError();
      let talentId = id;

      if (!fullName?.trim()) {
        setError('Full Name cannot be empty');
        return;
      }

      if (!email?.trim()) {
        setError('Email cannot be empty');
        return;
      }

      if (!startDate) {
        setError('Start Date cannot be empty');
        return;
      }

      if (!parseInt(agencyId)) {
        setError('Please select a new agency for this talent');
        return;
      }

      if (!cusIds.length) {
        setError('At least one customer is required');
        return;
      }
      const agencyName = findAgencyNameById(agencyId);
      const dataToSave = {
        ...talent,
        location: location || 'ua',
        isActive,
        cusIds,
        agencyId: Number(agencyId),
        agencyName,
        startDate: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
        endDate: endDate ? moment(endDate).format('YYYY-MM-DD') : null,
        birthday: birthday ? moment(birthday).format('YYYY-MM-DD') : null,
        linkedinProfileDate: linkedinProfileDate ? moment(linkedinProfileDate).format('YYYY-MM-DD') : null
      };

      const formData = objectToFormData(dataToSave);

      if (!dataToSave.cv) {
        formData.append('cv', null);
      }

      const { status } = await axios.put(`${API_URL}/talent`, formData);
      if (status === 204) {
        dispatch(updateSingleAggregatedTalent({ ...dataToSave, ...cusIds, agencyName: agencyName }));
        showNotificationSuccess('Talent updated successfully.');
      }
      if (sendMailFrequency) {
        const startDate = moment().startOf('day');
        const endDate = sendMailFrequency === 'annual' ? moment().endOf('y') : moment().endOf('d').add(13, 'days');
        const year = startDate.format('YYYY');
        await axios.post(`${API_URL}/sendNotificationManually`, { startDate, endDate, year, id: talentId });
        showNotificationSuccess(
          `${startCase(
            sendMailFrequency
          )} holiday email notifications have been sent to the customers of relevant talents.`
        );
      }
      handleCloseModal();
    } catch (error) {
      setError(error?.response?.data || 'Something went wrong');
      handleError(error, dispatch, history);
    }
  };

  const deletePicture = () => {
    setTalent(prev => ({ ...prev, picture: '' }));
  };

  const renderActiveTab = () => {
    if (isVacationAllowanceActive) {
      return <VacationAllowance talentId={id} API_URL={API_URL} />;
    }

    if (isFeedbacksActive) {
      return <Feedbacks talentId={id} />;
    }

    if (isTasksActive) {
      return <ObjectTasks id={id} type='employee' />;
    }

    if (isPersonalDetailsActive) {
      return (
        <form className='flex' onSubmit={event => event.preventDefault()}>
          <div className='flex flex-col mr-10'>
            <div>
              <div className='w-[284px] h-[284px] overflow-hidden'>
                <img
                  id='profile_picture'
                  className='w-full h-full object-contain'
                  src={picture || defaultPicture}
                  alt='profile'
                />
              </div>
              {picture && (
                <button onClick={deletePicture} className='relative left-[80px] bottom-[3px] bg-white rounded-full'>
                  <icons.closeModal style={{ width: '26px', height: '26px' }} />
                </button>
              )}
              <input
                type='file'
                id='picture'
                name='picture'
                onChange={onChangeHandler}
                className='opacity-0 z-10 relative cursor-pointer bottom-[10px]'
                accept='image/png, image/gif, image/jpeg'
              />
              <span className='relative left-[121px] bottom-[50px] pointer-events-none cursor-pointer'>
                {' '}
                <icons.imageCircle />{' '}
              </span>
              <span className='relative left-[134px] bottom-[86px] pointer-events-none cursor-pointer'>
                {' '}
                <icons.imageIcon />{' '}
              </span>
            </div>
            <div className='flex flex-col relative mt-[30px]'>
              <label htmlFor='feedbackFrequency' className='text-[#000] text-[14px] font-medium text-left mb-1'>
                Feedback Collection
              </label>
              <span className='relative left-[280px] top-[24px] pointer-events-none'>
                {' '}
                <icons.selectIcon />{' '}
              </span>
              <select
                defaultValue={feedbackFrequency}
                className='border text-[#9197B3] text-[14px] border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
                id='feedbackFrequency'
                onChange={onChangeHandler}
                name='feedbackFrequency'
              >
                <option value=''>Select Frequency</option>
                <option value=''>No Feedback Frequency</option>
                <option value='1w'>once a week</option>
                <option value='2w'>every two weeks</option>
                <option value='1m'>once a month</option>
                <option value='3m'>once in 3 months</option>
              </select>
              {error && (
                <p className='text-[#D0004B] absolute bottom-[3rem] text-[12px] flex items-center'>
                  <span className='mr-[5px]'>
                    {' '}
                    <icons.alert />{' '}
                  </span>{' '}
                  {error}
                </p>
              )}
              <button
                onClick={toggleResetPassword}
                className='flex justify-center w-[313px] py-[8px] mt-[52px] px-[16px] bg-[#169A52] rounded-md'
              >
                <span className='text-[#fff] text-[14px] font-medium text-center items-center'>Update Password</span>
                <span className='relative left-[70px]'>
                  {' '}
                  <icons.lockIcon />{' '}
                </span>
              </button>
            </div>
          </div>
          <div className='text-[14px] flex justify-start flex-col mr-[50px]'>
            <label htmlFor='fullName' className='text-[#000] text-[14px] font-medium text-left '>
              Full Name
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <input
              id='fullName'
              defaultValue={fullName}
              type='text'
              onChange={onChangeHandler}
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='cusIds' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Stakeholders
            </label>
            <div id='customers_to_select' className='multiple-select relative'>
              {cusIds?.length ? (
                <div
                  className='flex flex-wrap justify-start text-gray-500 py-2 px-8 border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-fit px-[15px] appearance-none outline-none'
                  onClick={toggleCustomers}
                >
                  {cusIds.map((id, i) => {
                    const { fullName } = getRelevantCustomer(id);
                    return (
                      <div key={id} className={`flex items-center${i === 0 ? '' : 'ml-10'}`}>
                        <span>{fullName}</span>
                        {i < cusIds.length - 1 && <span>,&nbsp;</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span
                  className='flex justify-start text-gray-500 py-2 px-8  bottom-4 mb-4 items-center underline border border-[#F5F0F0] text-[#9197B3] w-[313px] rounded-lg h-auto px-[15px] appearance-none outline-none'
                  onClick={toggleCustomers}
                >
                  Select Stakeholders
                </span>
              )}

              {showCustomers && (
                <div className='multiple-select border-x border-[#F5F0F0] relative bottom-4 max-h-[125px] overflow-auto customer-select px-1 bg-[#fff]'>
                  <div className='border rounded border-[#F5F0F0] mb-2 flex items-center mt-1'>
                    <span>
                      {' '}
                      <icons.search />{' '}
                    </span>
                    <input
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                      placeholder='Search'
                      className='outline-none ml-2.5 text-[14px] w-[200px]'
                      type='text'
                    />
                  </div>
                  {customersForStakeholdersDropdown.map(cus => {
                    const { id, fullName, organizationId } = cus;
                    const { name } = getRelevantOrganization(organizationId);

                    return (
                      <div key={id} className='flex flex-col'>
                        <div className='flex'>
                          <input
                            className='cursor-pointer'
                            type='checkbox'
                            checked={cusIds.includes(id)}
                            id={id}
                            name='customer'
                            onChange={event => handleCheckboxChange(id, event.target.id)}
                          />
                          <label htmlFor={id} className='ml-10'>{`${fullName} (${name})`}</label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <SearchableField
              name='Main Stakeholder'
              data={customersForMainStakeholder.map(customer => ({ key: `${customer.id}`, value: customer.fullName }))}
              selectedKeys={talentMainCustomer ? [`${talentMainCustomer}`] : []}
              emptyText='Select Main Stakeholder'
              onChangeSelectedKeys={selectedKeys => {
                onChangeHandler({
                  target: {
                    id: 'talentMainCustomer',
                    name: 'talentMainCustomer',
                    value: selectedKeys.length ? selectedKeys[selectedKeys.length - 1] : null
                  }
                });
              }}
            />
            <label htmlFor='Customer' className='text-[#000] text-[14px] font-medium text-left'>
              Customer
            </label>
            <input
              id='Customer'
              value={
                talent['talentMainCustomer'] && customersForMainStakeholder.length > 0
                  ? allOrganizations
                      .filter(org => organizationIdsForMainStakeholder.includes(org.id))
                      .map(org => ({ key: `${org.id}`, value: org.name }))[0].value
                  : 'None'
              }
              placeholder='Customer'
              className='mb-4 border border-[#F5F0F0]  text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />

            {/* <SearchableField
              name='Customer'
              data={talent['talentMainCustomer'] ? allOrganizations.filter(org => organizationIdsForMainStakeholder.includes(org.id)).map(org => ({ key: `${org.id}`, value: org.name })) : []}
              selectedKeys={organizations?.length ? [`${organizations[0].id}`] : []}
              emptyText= {talent['talentMainCustomer'] ? allOrganizations.filter(org => organizationIdsForMainStakeholder.includes(org.id)).map(org => ({ key: `${org.id}`, value: org.name }))[0].value : 'None'}
              onChangeSelectedKeys={selectedKeys => {
                if (!selectedKeys.length) {
                  return;
                }
                const id = selectedKeys[selectedKeys.length - 1];
                const org = allOrganizations.find(org => `${org.id}` === `${id}`);

                onChangeHandler({
                  target: {
                    id: 'organizations',
                    name: 'organizations',
                    value: org ? [{ id: org.id, name: org.name }] : []
                  }
                });
              }}
            /> */}

            <label htmlFor='email' className='text-[#000] text-[14px] mt-2 font-medium text-left'>
              E-mail
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <input
              id='email'
              type='email'
              name='email'
              onChange={onChangeHandler}
              defaultValue={email}
              placeholder='iris@gmail.com'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='address' className='text-[#000] text-[14px] font-medium text-left'>
              Address
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <input
              id='address'
              name='address'
              onChange={onChangeHandler}
              defaultValue={address}
              placeholder='Employee Address'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='position' className='text-[#000] text-[14px] font-medium text-left'>
              Position
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <input
              id='position'
              name='position'
              onChange={onChangeHandler}
              defaultValue={position}
              placeholder='Position here'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='removeReason' className='text-[#000] text-[14px] font-medium text-left'>
              Reason For Removal
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <input
              id='removeReason'
              name='removeReason'
              onChange={onChangeHandler}
              defaultValue={removeReason}
              placeholder='Reason For Removal'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='startDate' className='text-[#000] text-[14px] font-medium text-left'>
              Start Date
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none z-50'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <DatePicker
              selected={formattedStartDate}
              onChange={date => onChangeHandler({ target: { id: 'startDate', value: date } })}
              id='startDate'
              selectsStart
              showMonthDropdown
              showYearDropdown
              placeholderText={'DD/MM/YYYY'}
              dateFormat='dd/MM/yyyy'
              className='border border-[#F5F0F0] w-[313px] text-[#9197B3] mb-4 rounded-lg h-[40px] px-[15px] outline-none'
            />
            <label htmlFor='endDate' className='text-[#000] text-[14px] font-medium text-left'>
              End Date
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none z-50'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <DatePicker
              selected={formattedEndDate}
              onChange={date => onChangeHandler({ target: { id: 'endDate', value: date } })}
              id='endDate'
              selectsStart
              showMonthDropdown
              showYearDropdown
              placeholderText={'DD/MM/YYYY'}
              dateFormat='dd/MM/yyyy'
              className='border border-[#F5F0F0] w-[313px] text-[#9197B3] mb-4 rounded-lg h-[40px] px-[15px] outline-none'
            />
            <label htmlFor='telegram' className='text-[#000] text-[14px] font-medium text-left'>
              Telegram
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <input
              id='telegram'
              defaultValue={telegram}
              onChange={onChangeHandler}
              placeholder='@telegram'
              className='mb-4 border border-[#F5F0F0]  text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='linkedinProfileChecked' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Linkedin Checked
            </label>
            <div className='flex items-center h-[40px] px-2'>
              <input
                className='cursor-pointer w-4 h-4'
                type='checkbox'
                checked={linkedinProfileChecked}
                id='linkedinProfileChecked'
                name='linkedinProfileChecked'
                onChange={onChangeHandler}
              />
            </div>
            <label htmlFor='canWorkOnTwoPositions' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Can Work On Two Positions
            </label>
            <div className='flex items-center h-[40px] px-2'>
              <input
                className='cursor-pointer w-4 h-4'
                type='checkbox'
                checked={canWorkOnTwoPositions}
                id='canWorkOnTwoPositions'
                name='canWorkOnTwoPositions'
                onChange={onChangeHandler}
              />
            </div>
          </div>
          <div className='text-[14px] mr-[50px] flex justify-start flex-col'>
            <label htmlFor='phoneNumber' className='text-[#000] text-[14px] font-medium text-left'>
              Mobile Phone
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <input
              id='phoneNumber'
              name='phoneNumber'
              onChange={onChangeHandler}
              value={phoneNumber}
              placeholder='Mobile phone'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='location' className='text-[#000] text-[14px] font-medium text-left'>
              Location
            </label>
            <span className='relative left-[280px] top-[24px] pointer-events-none'>
              {' '}
              <icons.selectIcon />{' '}
            </span>
            <select
              className='border text-[#9197B3] text-[14px] mb-4 border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
              id='location'
              name='location'
              defaultValue={location}
              onChange={onChangeHandler}
            >
              {Object.entries(codeToCountry).map(([code, countryName]) => {
                return (
                  <option value={code} key={code}>
                    {countryName}
                  </option>
                );
              })}
            </select>
            <label htmlFor='birthday' className='text-[#000] mb-[7px] text-[14px] font-medium text-left'>
              Birthday
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none z-50'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <DatePicker
              id='birthday'
              selected={formattedBirthday}
              onChange={date => onChangeHandler({ target: { id: 'birthday', value: date } })}
              selectsStart
              showMonthDropdown
              showYearDropdown
              placeholderText={'DD/MM/YYYY'}
              dateFormat='dd/MM/yyyy'
              className='border border-[#F5F0F0] text-[#9197B3] mb-4 w-[313px] rounded-lg h-[40px] px-[15px] outline-none'
            />
            <label htmlFor='projectName' className='text-[#000] text-[14px] font-medium text-left'>
              Project
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <input
              id='projectName'
              name='projectName'
              onChange={onChangeHandler}
              defaultValue={projectName}
              placeholder='Project Name here'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='agencyId' className='text-[#000] text-[14px] font-medium text-left'>
              Agency
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <select
              id='agencyId'
              name='agencyId'
              onChange={onChangeHandler}
              defaultValue={parseInt(agencyId)}
              placeholder='Iris Levy'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            >
              {!parseInt(agencyId) && <option>-- SELECT NEW AGENCY --</option>}
              {agencies.map(agency => (
                <option key={agency.id} value={parseInt(agency.id)}>
                  {agency.name}
                </option>
              ))}
            </select>
            <label htmlFor='whatsup' className='text-[#000] text-[14px] font-medium text-left'>
              Whatsup
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <input
              onChange={onChangeHandler}
              id='whatsup'
              defaultValue={whatsup}
              placeholder='@whatsup'
              className='border  mb-4 border-[#F5F0F0] text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='summary' className='text-[#000] text-[14px] font-medium text-left'>
              Summary
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <input
              onChange={onChangeHandler}
              id='summary'
              defaultValue={summary}
              placeholder='Summary'
              className='mb-4 border border-[#F5F0F0] text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='linkedinProfile' className='text-[#000] text-[14px] font-medium text-left'>
              Linkedin Profile
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <div className='relative'>
              <input
                onChange={onChangeHandler}
                id='linkedinProfile'
                defaultValue={linkedinProfile}
                placeholder='Linkedin Profile URL'
                className='mb-4 border border-[#F5F0F0] text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
              />
              {linkedinProfile && isValidLink(linkedinProfile) && (
                <div
                  onClick={() => {
                    window.open(linkedinProfile, '_blank');
                  }}
                  className='absolute h-[22px] w-[22px] top-[9px] right-[8px] bg-[#d1d4df] rounded-full pointer'
                >
                  <svg width='100' height='50' xmlns='http://www.w3.org/2000/svg'>
                    <polygon points='8,5 8,17 18,11' fill='#262626' stroke-width='2' />
                  </svg>
                </div>
              )}
            </div>
            <label htmlFor='linkedinProfileDate' className='text-[#000] mb-[7px] text-[14px] font-medium text-left'>
              Linkedin Checked Date
            </label>
            <span className='relative left-[280px] top-[25px] pointer-events-none z-50'>
              {' '}
              <icons.editIcon />{' '}
            </span>
            <DatePicker
              id='linkedinProfileDate'
              selected={formattedLinkedinProfileDate}
              onChange={date => onChangeHandler({ target: { id: 'linkedinProfileDate', value: date } })}
              selectsStart
              showMonthDropdown
              showYearDropdown
              placeholderText={'DD/MM/YYYY'}
              dateFormat='dd/MM/yyyy'
              className='border border-[#F5F0F0] text-[#9197B3] mb-4 w-[313px] rounded-lg h-[40px] px-[15px] outline-none'
            />
            <label htmlFor='linkedinComment' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Linkedin Comment
            </label>
            <input
              onChange={onChangeHandler}
              name='linkedinComment'
              id='linkedinComment'
              value={linkedinComment}
              placeholder='Linkedin Comment'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='hourlyRate' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Hourly Rate
            </label>
            <div className='flex items-center h-[40px] mb-4 px-2'>
              <input
                className='cursor-pointer w-4 h-4'
                type='checkbox'
                checked={hourlyRate}
                id='hourlyRate'
                name='hourlyRate'
                onChange={onChangeHandler}
              />
            </div>
            <label htmlFor='cv' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              CV
            </label>
            <div className='flex items-center h-[40px] mb-4 px-2'>
              <UploadCV
                getInitialFile={
                  cv
                    ? () => {
                        return axios
                          .get(`${API_URL}/talent/${id}/cv`, { responseType: 'blob' })
                          .then(res => res.data)
                          .then(blob => {
                            const file = new File([blob], 'cv.pdf', { type: 'application/pdf' });
                            return file;
                          })
                          .catch(console.log);
                      }
                    : null
                }
                onChange={file => {
                  onChangeHandler({
                    target: {
                      id: 'cv',
                      name: 'cv',
                      value: file
                    }
                  });
                }}
              />
            </div>
          </div>
        </form>
      );
    }
  };

  return (
    <>
      {isUpdatePasswordModalVisible && (
        <UpdatePassword
          API_URL={API_URL}
          talentToEdit={talentToEdit}
          displayModal={isUpdatePasswordModalVisible}
          closeModal={() => toggleResetPassword()}
        />
      )}
      <GenericModal displayModal={!isPasswordEditing && displayModal} closeModal={closeModal}>
        <div className='px-10'>
          <div className='flex justify-between items-center mb-5 border-b border-[#9197B333] pb-8'>
            <h1 className='text-[#333] font-medium text-[20px]'>{fullName}</h1>
            <div className='flex items-center font-medium text-[#333] text-[14px]'>
              {tabs.map(tab => {
                const isTabActive = activeTab === tab;
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
          {renderActiveTab()}
        </div>
        {isPersonalDetailsActive && (
          <div className='flex items-center justify-end mt-2'>
            <button
              onClick={() => handleCloseModal()}
              className='w-[145px] px-[16px] mr-2.5 py-[8px] border-[#E0E0E0] border rounded-md font-medium text-[#020202] text-[14px]'
            >
              Cancel
            </button>
            <button
              className='px-[16px] py-[8px] mr-2.5 bg-[#4D4AEA] font-medium rounded-md w-fit text-[14px] text-[#fff]'
              onClick={() => saveDetails('2 weeks')}
              disabled={loading}
            >
              {loading ? <SmallLoader tiny /> : 'Save and send 2 weeks notifications'}
            </button>
            <button
              className='px-[16px] mr-2.5 py-[8px] bg-[#4D4AEA] font-medium rounded-md w-fit text-[14px] text-[#fff]'
              onClick={() => saveDetails('annual')}
              disabled={loading}
            >
              {loading ? <SmallLoader tiny /> : 'Save and send annual notifications'}
            </button>
            <button
              onClick={() => saveDetails()}
              className='px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-fit text-[14px] text-[#fff]'
            >
              Save changes
            </button>
          </div>
        )}
      </GenericModal>
    </>
  );
};

export default EditTalentModal;
