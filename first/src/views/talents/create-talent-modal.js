import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GenericModal from '../components/modal/GenericModal';
import icons from '../../icons';
import defaultPicture from '../../icons/default_picture_circle.png';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { updateSingleAggregatedTalent } from '../../store/actionCreator';
import { showNotificationSuccess } from '../../utils/notifications';
import getBase64 from '../../utils/getBase64';
import moment from 'moment/moment';
import SmallLoader from '../loaders/SmallLoader';
import { startCase } from 'lodash';
import { SearchableField } from '../components/fields/SearchableField';
import { UploadCV } from './UploadCV';
import { objectToFormData } from '../../utils/objectToFormData';

const CreateTalentModal = ({
  displayModal,
  closeModal,
  API_URL,
  getRelevantOrganization,
  getRelevantCustomer,
  customers,
  agencies
}) => {
  const [error, setError] = useState('');
  const [showCustomers, setShowCustomers] = useState(false);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const { codeToCountry } = useSelector(state => state.countries);
  const allOrganizations = useSelector(state => state.organizations);

  const dispatch = useDispatch();

  const findAgencyNameById = id => {
    const agencyName = agencies.find(agency => agency.id === id);
    return agencyName ? agencyName.name : null;
  };

  const activeCustomers = customers.filter(cus => !cus.inactive);

  const filteredCustomers = filter
    ? activeCustomers.filter(cus => {
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
    : activeCustomers;

  const toggleCustomers = () => {
    setShowCustomers(state => !state);
  };

  const initValues = {
    fullName: '',
    location: 'ua',
    email: '',
    cusIds: [],
    picture: '',
    isActive: true,
    projectName: '',
    position: '',
    removeReason: '',
    agencyId: Number(1),
    startDate: null,
    endDate: null,
    birthday: null,
    address: '',
    phoneNumber: '',
    telegram: '',
    whatsup: '',
    feedbackFrequency: '',
    summary: '',
    talentMainCustomer: '',
    organizations: allOrganizations.length ? [{ id: allOrganizations[0].id, name: allOrganizations[0].name }] : [],
    hourlyRate: false,
    canWorkOnTwoPositions: false,
    linkedinProfileChecked: false,
    ignoreLinkedinCheck: false,
    linkedinProfile: '',
    linkedinProfileDate: null,
    linkedinComment: ''
  };
  const initState = { values: initValues };
  const [formState, setFormState] = useState(initState);

  const { values } = formState;
  const { cusIds } = values;

  const organizationIdsForMainStakeholder = customers
    .filter(cus => !cus.inactive && `${cus.id}` === `${values.talentMainCustomer}`)
    .map(cus => cus.organizationId);

  const createTalent = async sendMailFrequency => {
    try {
      const requiredFields = [
        { field: 'fullName', message: 'Full Name is required' },
        { field: 'email', message: 'Email is required' },
        { field: 'startDate', message: 'Start Date is required' },
        { field: 'agencyId', message: 'Agency is required' }
      ];

      if (!values['fullName']?.trim()) {
        setError('Full Name cannot be empty');
        return;
      }

      if (!values['email']?.trim()) {
        setError('Email cannot be empty');
        return;
      }

      for (const fieldInfo of requiredFields) {
        const { field, message } = fieldInfo;
        if (!values[field]) {
          setError(message);
          return;
        }
      }

      if (!cusIds.length) {
        setError('At least one stakeholder is required');
        return;
      }

      const agencyIdToNumber = Number(values.agencyId);
      setLoading(true);
      const dataToSave = {
        ...values,
        startDate: values.startDate ? moment(values.startDate).format('YYYY-MM-DD') : null,
        endDate: values.endDate ? moment(values.endDate).format('YYYY-MM-DD') : null,
        birthday: values.birthday ? moment(values.birthday).format('YYYY-MM-DD') : null,
        linkedinProfileDate: values.linkedinProfileDate
          ? moment(values.linkedinProfileDate).format('YYYY-MM-DD')
          : null,
        feedbackFrequency: values.feedbackFrequency !== '' ? values.feedbackFrequency : null,
        agencyIdToNumber
      };

      const formData = objectToFormData(dataToSave);

      const response = await axios.post(`${API_URL}/talent`, formData);

      if (response.status >= 200 && response.status <= 300) {
        const {
          fullName,
          email,
          address,
          agencyId,
          birthday,
          id,
          location,
          phoneNumber,
          position,
          removeReason,
          projectName,
          startDate,
          endDate,
          cusIds,
          whatsup,
          telegram,
          summary,
          talentMainCustomer,
          organizations,
          feedbackFrequency,
          picture,
          hourlyRate,
          canWorkOnTwoPositions,
          linkedinProfile,
          linkedinComment,
          linkedinProfileChecked,
          linkedinProfileDate,
          cv
        } = response.data.savedTalent;

        const newTalentData = {
          fullName,
          email,
          address,
          birthday,
          id,
          picture,
          location,
          phoneNumber,
          position,
          removeReason,
          projectName,
          startDate,
          endDate,
          cusIds: cusIds.map(id => Number(id)),
          whatsup,
          telegram,
          summary,
          hourlyRate,
          canWorkOnTwoPositions,
          linkedinProfile,
          linkedinComment,
          linkedinProfileChecked,
          linkedinProfileDate,
          talentMainCustomer,
          organizations,
          agencyId,
          feedbackFrequency,
          cv
        };
        const agencyName = findAgencyNameById(agencyIdToNumber);

        dispatch(updateSingleAggregatedTalent({ ...newTalentData, agencyName }));
        showNotificationSuccess('Talent created successfully.');

        if (sendMailFrequency) {
          const startDate = moment().startOf('day');
          const endDate = sendMailFrequency === 'annual' ? moment().endOf('y') : moment().endOf('d').add(13, 'days');
          const year = startDate.format('YYYY');
          await axios.post(`${API_URL}/sendNotificationManually`, { startDate, endDate, year, id: id });
          showNotificationSuccess(
            `${startCase(
              sendMailFrequency
            )} holiday email notifications have been sent to the customers of relevant talents.`
          );
        }
        handleCloseModal();

        setFormState({ values: initValues });
        setLoading(false);
        setError('');
      }
    } catch (error) {
      setLoading(false);
      setError(error.response.data);
    }
  };

  const handleChangeForm = ({ target }) =>
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [target.name]: target.value
      }
    }));

  const handleCheckboxChange = (customerId, event) => {
    const isChecked = event.target.checked;

    setFormState(prev => {
      const updatedCusIds = isChecked
        ? [...prev.values.cusIds, customerId]
        : prev.values.cusIds.filter(id => id !== customerId);

      return {
        ...prev,
        values: {
          ...prev.values,
          cusIds: updatedCusIds
        }
      };
    });
  };

  const handleFileChange = async event => {
    const file = event.target.files[0];

    if (file) {
      removeError();

      if (file.size > 300000) {
        setError('File size should be less than 300 kb');
        return;
      }

      const imgArea = document.getElementById('profile_picture');
      const base64Image = await getBase64(file);

      imgArea.src = base64Image;

      setFormState(prev => ({
        ...prev,
        values: {
          ...prev.values,
          picture: base64Image
        }
      }));
    }
  };

  const removeError = () => {
    setError('');
  };

  const handleRemovePicture = () => {
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        picture: ''
      }
    }));
  };
  const handleCloseModal = () => {
    closeModal();
  };

  return (
    <GenericModal displayModal={displayModal} closeModal={closeModal}>
      <div className='px-10'>
        <div className='flex mb-5'>
          <span className='mr-2.5'>
            {' '}
            <icons.addUserGray />{' '}
          </span>
          <h1 className='text-[#333] font-medium text-[20px]'>Add Employee</h1>
        </div>
        <form className='flex' onSubmit={event => event.preventDefault()}>
          <div className='text-[14px] flex justify-start flex-col mr-[50px]'>
            <label htmlFor='fullName' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Full Name
            </label>
            <input
              name='fullName'
              value={values.fullName}
              onChange={handleChangeForm}
              placeholder='Iris Levy'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='cusIds' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Stakeholders
            </label>
            <div id='customers_to_select' className='multiple-select'>
              {cusIds?.length ? (
                <div
                  className='flex flex-wrap justify-start text-gray-500 py-2 px-8 underline border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-fit px-[15px] appearance-none outline-none'
                  onClick={toggleCustomers}
                >
                  {cusIds.map((id, i) => {
                    const { fullName } = getRelevantCustomer(id);
                    return (
                      <div key={id} className={`flex items-center${i === 0 ? '' : ' ml-2'}`}>
                        <div>{fullName}</div>
                        {i < cusIds.length - 1 && <div className='mx-1'>,</div>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span
                  onClick={toggleCustomers}
                  className='min-h-[40px] flex justify-start text-gray-500 py-2 px-8 items-center underline border mb-4 border-[#F5F0F0] text-[#9197B3] w-[313px] rounded-lg h-auto px-[15px] appearance-none outline-none'
                >
                  Select Customer
                </span>
              )}

              {showCustomers && (
                <div className='multiple-select border-x border-[#F5F0F0] relative bottom-4 max-h-[125px] overflow-auto customer-select  px-1 bg-[#fff]'>
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
                  {filteredCustomers.map(cus => {
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
                            onChange={event => handleCheckboxChange(id, event)}
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
              data={activeCustomers
                .map(customer =>
                  cusIds.includes(customer.id) ? { key: `${customer.id}`, value: customer.fullName } : null
                )
                .filter(Boolean)}
              selectedKeys={values.talentMainCustomer ? [`${values.talentMainCustomer}`] : []}
              emptyText='Select Main Stakeholder'
              onChangeSelectedKeys={selectedKeys => {
                handleChangeForm({
                  target: {
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
                values.talentMainCustomer && cusIds.length > 0
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
              data={allOrganizations.map(org => ({ key: `${org.id}`, value: org.name }))}
              selectedKeys={values.organizations?.length ? [`${values.organizations[0].id}`] : []}
              emptyText='Select'
              onChangeSelectedKeys={selectedKeys => {
                if (!selectedKeys.length) {
                  return;
                }
                const id = selectedKeys[selectedKeys.length - 1];
                const org = allOrganizations.find(org => `${org.id}` === `${id}`);

                handleChangeForm({
                  target: {
                    name: 'organizations',
                    value: org ? [{ id: org.id, name: org.name }] : []
                  }
                });
              }}
            /> */}

            <label htmlFor='email' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              E-mail
            </label>
            <input
              type='email'
              name='email'
              onChange={handleChangeForm}
              value={values.email}
              placeholder='iris@gmail.com'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='address' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Address
            </label>
            <input
              name='address'
              onChange={handleChangeForm}
              value={values.address}
              placeholder='Employee Address'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='position' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Position
            </label>
            <input
              name='position'
              onChange={handleChangeForm}
              value={values.position}
              placeholder='Position here'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='removeReason' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Reason For Removal
            </label>
            <input
              name='removeReason'
              onChange={handleChangeForm}
              value={values.removeReason}
              placeholder='Reason For Removal'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='startDate' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Start Date
            </label>
            <DatePicker
              selected={values.startDate}
              onChange={date => handleChangeForm({ target: { name: 'startDate', value: date } })}
              selectsStart
              showMonthDropdown
              showYearDropdown
              placeholderText={'DD/MM/YYYY'}
              dateFormat='dd/MM/yyyy'
              className='border border-[#F5F0F0] w-[313px] mb-4 rounded-lg h-[40px] px-[15px] outline-none'
            />
            <label htmlFor='endDate' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              End Date
            </label>
            <DatePicker
              selected={values.endDate}
              onChange={date => handleChangeForm({ target: { name: 'endDate', value: date } })}
              selectsStart
              showMonthDropdown
              showYearDropdown
              placeholderText={'DD/MM/YYYY'}
              dateFormat='dd/MM/yyyy'
              className='border border-[#F5F0F0] w-[313px] mb-4 rounded-lg h-[40px] px-[15px] outline-none'
            />
            <label htmlFor='telegram' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Telegram
            </label>
            <input
              onChange={handleChangeForm}
              name='telegram'
              value={values.telegram}
              placeholder='@telegram'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='ignoreLinkedinCheck' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Ignore Linkedin Check
            </label>
            <div className='flex items-center h-[40px] mb-4 px-2'>
              <input
                className='cursor-pointer w-4 h-4'
                type='checkbox'
                checked={values.ignoreLinkedinCheck}
                id='ignoreLinkedinCheck'
                name='ignoreLinkedinCheck'
                onChange={event =>
                  handleChangeForm({ target: { name: 'ignoreLinkedinCheck', value: event.target.checked } })
                }
              />
            </div>
            <label htmlFor='canWorkOnTwoPositions' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Can Work On Two Positions
            </label>
            <div className='flex items-center h-[40px] mb-4 px-2'>
              <input
                className='cursor-pointer w-4 h-4'
                type='checkbox'
                checked={values.canWorkOnTwoPositions}
                id='canWorkOnTwoPositions'
                name='canWorkOnTwoPositions'
                onChange={event =>
                  handleChangeForm({ target: { name: 'canWorkOnTwoPositions', value: event.target.checked } })
                }
              />
            </div>
            {error && (
              <p className='text-[#D0004B] my-3 text-[12px] flex items-center'>
                <span className='mr-[5px]'>
                  {' '}
                  <icons.alert />{' '}
                </span>{' '}
                {error}
              </p>
            )}
          </div>
          <div className='text-[14px] mr-[50px] flex justify-start flex-col'>
            <label htmlFor='phoneNumber' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Mobile Phone
            </label>
            <input
              name='phoneNumber'
              onChange={handleChangeForm}
              value={values.phoneNumber}
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
              value={values.location}
              onChange={handleChangeForm}
            >
              {Object.entries(codeToCountry ?? {}).map(([code, countryName]) => {
                return (
                  <option value={code} key={code}>
                    {countryName}
                  </option>
                );
              })}
            </select>
            <label htmlFor='birthday' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Birthday
            </label>
            <DatePicker
              selected={values.birthday}
              onChange={date => handleChangeForm({ target: { name: 'birthday', value: date } })}
              selectsStart
              showMonthDropdown
              showYearDropdown
              placeholderText={'DD/MM/YYYY'}
              dateFormat='dd/MM/yyyy'
              className='border border-[#F5F0F0] mb-4 w-[313px] rounded-lg h-[40px] px-[15px] outline-none'
            />
            <label htmlFor='projectName' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Project
            </label>
            <input
              name='projectName'
              onChange={handleChangeForm}
              value={values.projectName}
              placeholder='Project Name here'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='agencyId' className='text-[#000] text-[14px] font-medium text-left'>
              Agency
            </label>
            <span className='relative left-[280px] top-[24px] pointer-events-none'>
              {' '}
              <icons.selectIcon />{' '}
            </span>
            <select
              id='agencyId'
              name='agencyId'
              onChange={handleChangeForm}
              value={values.agencyId}
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            >
              {agencies.map(agency => (
                <option id='agencyId' name='agencyId' key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
            <label htmlFor='whatsup' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Whatsup
            </label>
            <input
              onChange={handleChangeForm}
              name='whatsup'
              value={values.whatsup}
              placeholder='@whatsup'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='summary' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Summary
            </label>
            <input
              onChange={handleChangeForm}
              name='summary'
              value={values.summary}
              placeholder='Summary'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <label htmlFor='linkedinProfile' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Linkedin Profile
            </label>
            <input
              onChange={handleChangeForm}
              name='linkedinProfile'
              value={values.linkedinProfile}
              placeholder='Linkedin Profile URL'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            {!values.ignoreLinkedinCheck ? (
              <>
                <label
                  htmlFor='linkedinProfileChecked'
                  className='text-[#000] text-[14px] font-medium text-left mb-[8px]'
                >
                  Linkedin Checked
                </label>
                <div className='flex items-center h-[40px] mb-4 px-2'>
                  <input
                    className='cursor-pointer w-4 h-4'
                    type='checkbox'
                    checked={values.linkedinProfileChecked}
                    id='linkedinProfileChecked'
                    name='linkedinProfileChecked'
                    onChange={event =>
                      handleChangeForm({ target: { name: 'linkedinProfileChecked', value: event.target.checked } })
                    }
                  />
                </div>
                <label htmlFor='linkedinProfileDate' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
                  Linkedin Checked Date
                </label>
                <DatePicker
                  selected={values.linkedinProfileDate}
                  onChange={date => handleChangeForm({ target: { name: 'linkedinProfileDate', value: date } })}
                  selectsStart
                  showMonthDropdown
                  showYearDropdown
                  placeholderText={'DD/MM/YYYY'}
                  dateFormat='dd/MM/yyyy'
                  className='border border-[#F5F0F0] mb-4 w-[313px] rounded-lg h-[40px] px-[15px] outline-none'
                />
              </>
            ) : (
              ''
            )}
            <label htmlFor='linkedinComment' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              Linkedin Comment
            </label>
            <input
              onChange={handleChangeForm}
              name='linkedinComment'
              value={values.linkedinComment}
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
                checked={values.hourlyRate}
                id='hourlyRate'
                name='hourlyRate'
                onChange={event => handleChangeForm({ target: { name: 'hourlyRate', value: event.target.checked } })}
              />
            </div>
            <label htmlFor='cv' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
              CV
            </label>
            <div className='flex items-center h-[40px] mb-4 px-2'>
              <UploadCV
                onChange={file => {
                  setFormState(prev => ({
                    ...prev,
                    values: {
                      ...prev.values,
                      cv: file
                    }
                  }));
                }}
              />
            </div>
          </div>
          <div className='flex flex-col'>
            <div>
              <div className='w-[284px] h-[284px] overflow-hidden'>
                <img
                  id='profile_picture'
                  className='w-full h-full object-contain'
                  src={values.picture ? values.picture : defaultPicture}
                  alt='profile'
                />
              </div>
              {values.picture && (
                <button
                  onClick={handleRemovePicture}
                  className='relative left-[80px] bottom-[3px] bg-white rounded-full'
                >
                  <icons.closeModal style={{ width: '26px', height: '26px' }} />
                </button>
              )}
              <input
                type='file'
                id='picture'
                name='picture'
                onChange={handleFileChange}
                className='opacity-0 relative cursor-pointer left-[95px] bottom-[10px]'
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
            <div className='flex flex-col mt-2'>
              <label htmlFor='feedbackFrequency' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
                Feedback Collection
              </label>
              <span className='relative left-[280px] top-[24px] pointer-events-none'>
                {' '}
                <icons.selectIcon />{' '}
              </span>
              <select
                onChange={handleChangeForm}
                className='border text-[#9197B3] text-[14px] border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
                id='feedbackFrequency'
                value={values.feedbackFrequency}
                name='feedbackFrequency'
              >
                <option value=''>Select Frequency</option>
                <option value=''>No Feedback Frequency</option>
                <option value='1w'>once a week</option>
                <option value='2w'>every two weeks</option>
                <option value='1m'>once a month</option>
              </select>
            </div>
          </div>
        </form>
        <div className='flex items-center justify-end'>
          <button
            onClick={() => handleCloseModal()}
            className='w-[145px] px-[16px] mr-2.5 py-[8px] border-[#E0E0E0] border rounded-md font-medium text-[#020202] text-[14px]'
          >
            Cancel
          </button>
          <button
            className='px-[16px] py-[8px] mr-2.5 bg-[#4D4AEA] font-medium rounded-md w-fit text-[14px] text-[#fff]'
            onClick={() => createTalent('2 weeks')}
            disabled={loading}
          >
            {loading ? <SmallLoader tiny /> : 'Save and send 2 weeks notifications'}
          </button>
          <button
            className='px-[16px] mr-2.5 py-[8px] bg-[#4D4AEA] font-medium rounded-md w-fit text-[14px] text-[#fff]'
            onClick={() => createTalent('annual')}
            disabled={loading}
          >
            {loading ? <SmallLoader tiny /> : 'Save and send annual notifications'}
          </button>
          <button
            onClick={() => createTalent()}
            className='px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-fit text-[14px] text-[#fff]'
            disabled={loading}
          >
            {loading ? <SmallLoader tiny /> : 'Save'}
          </button>
        </div>
      </div>
    </GenericModal>
  );
};

export default CreateTalentModal;
