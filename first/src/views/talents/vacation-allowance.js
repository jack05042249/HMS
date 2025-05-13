import moment from 'moment/moment';
import icons from '../../icons';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { allowedVacationDaysPush, basicVacationValuesPush, usedVacationDaysPush } from '../../store/actionCreator';
import { showNotificationSuccess } from '../../utils/notifications';
import SmallLoader from '../loaders/SmallLoader';

const VacationAllowance = ({ talentId, API_URL }) => {
  const currentYear = moment().year();
  const [editModes, setEditModes] = useState({
    vacation: false,
    sick: false,
    unpaid: false,
    bonus: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { fixedBalance, usedDays, allowedDays } = useSelector(state => state);
  const inputRefs = useRef([]);
  const initValues = {
    vacationDays: 0,
    sickDays: 0,
    unpaidDays: 0,
    bonusDays: 0
  };
  const initState = { values: initValues };
  const [formState, setFormState] = useState(initState);

  const { values } = formState;
  const handleSave = async () => {
    const dataToSave = {
      vacationDays: values.vacationDays,
      sickDays: values.sickDays,
      unpaidDays: values.unpaidDays,
      bonusDays: values.bonusDays,
      talentId: talentId
    };
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/vacation/updateBalance/${talentId}`, dataToSave);
      if (response.status >= 200 && response.status < 300) {
        setEditModes({
          vacation: false,
          sick: false,
          unpaid: false,
          bonus: false
        });
        dispatch(allowedVacationDaysPush(response.data));
        setLoading(false);
        showNotificationSuccess('Vacation data successfully updated!');
      }
    } catch (error) {
      setError(error);
      console.error('Error saving data:', error);
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

  useEffect(() => {
    if (editModes.vacation) {
      inputRefs.current[0]?.focus();
    } else if (editModes.sick) {
      inputRefs.current[1]?.focus();
    } else if (editModes.unpaid) {
      inputRefs.current[2]?.focus();
    } else if (editModes.bonus) {
      inputRefs.current[3]?.focus();
    }
  }, [editModes]);

  const handleEditClick = field => {
    Object.keys(editModes).forEach(key => {
      if (key !== field && editModes[key]) {
        setEditModes(prevModes => ({
          ...prevModes,
          [key]: false
        }));
      }
    });

    setEditModes(
      prevModes => ({
        ...prevModes,
        [field]: !prevModes[field]
      }),
      () => {
        if (!editModes[field]) {
          switch (field) {
            case 'vacation':
              inputRefs.current[0]?.focus();
              break;
            case 'sick':
              inputRefs.current[1]?.focus();
              break;
            case 'unpaid':
              inputRefs.current[2]?.focus();
              break;
            case 'bonus':
              inputRefs.current[3]?.focus();
              break;
            default:
              break;
          }
        }
      }
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (talentId) {
          const responseUsedDays = await axios.get(`${API_URL}/vacation/usedDays/${talentId}`);
          dispatch(usedVacationDaysPush(responseUsedDays.data));

          const responseBasicValues = await axios.get(`${API_URL}/vacation/fixedBalance/${talentId}`);
          dispatch(basicVacationValuesPush(responseBasicValues.data));

          setFormState(prevState => ({
            ...prevState,
            values: responseBasicValues.data
          }));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, [talentId, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (talentId) {
          const responseAllowedDays = await axios.get(`${API_URL}/vacation/availableDays/${talentId}`);
          dispatch(allowedVacationDaysPush(responseAllowedDays.data));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, [talentId, dispatch, API_URL]);

  return (
    <div>
      <table className='w-[1000px] text-sm text-left rtl:text-right text-gray-500 border-b border-gray-100 mb-[50px]'>
        <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
          <tr>
            <th scope='col' className='px-6 font-semibold py-3 text-[#333] text-[14px]'>
              Allowance
            </th>
            <th scope='col' className='px-6 py-3 font-medium'>
              <icons.vacationCircle
                style={{ width: '16px', height: '16px', position: 'relative', top: '19px', right: '25px' }}
              />
              <p>Vacation</p>
            </th>
            <th scope='col' className='px-6 py-3 font-medium'>
              <icons.sickCircle
                style={{ width: '16px', height: '16px', position: 'relative', top: '19px', right: '25px' }}
              />
              <p>Sick Leave</p>
            </th>
            <th scope='col' className='px-6 py-3 font-medium'>
              <icons.unpaidCircle
                style={{ width: '16px', height: '16px', position: 'relative', top: '19px', right: '25px' }}
              />
              <p>Unpaid Leave</p>
            </th>
            <th scope='col' className='px-6 py-3 font-medium'>
              <icons.bonusOffDaysCircle
                style={{ width: '16px', height: '16px', position: 'relative', top: '19px', right: '25px' }}
              />
              <p>Bonus Days</p>
            </th>
          </tr>
        </thead>
        <tbody className='text-[12px] text-[#9197B3]'>
          <tr className='bg-white'>
            <th className='px-6 py-4 font-semibold text-[#333] text-[14px]'>{currentYear}</th>
            <th className='px-6 py-4 font-normal'>
              <input
                type='text'
                name='vacationDays'
                id='vacationdays'
                className={`bg-white w-4 outline-none ${editModes.vacation ? 'underline' : ''}`}
                ref={el => (inputRefs.current[0] = el)}
                disabled={!editModes.vacation}
                onChange={handleChangeForm}
                value={values.vacationDays}
              />{' '}
              days per year
              <button className='ml-3 relative top-0.5' onClick={() => handleEditClick('vacation')}>
                <span>
                  {' '}
                  <icons.editIcon />{' '}
                </span>
              </button>
            </th>
            <th className='px-6 py-4 font-normal'>
              <input
                type='text'
                name='sickDays'
                id='sickDays'
                className={`bg-white w-4 outline-none ${editModes.sick ? 'underline' : ''}`}
                ref={el => (inputRefs.current[1] = el)}
                disabled={!editModes.sick}
                onChange={handleChangeForm}
                value={values.sickDays}
              />{' '}
              days per year
              <button className='ml-3 relative top-0.5' onClick={() => handleEditClick('sick')}>
                <span>
                  {' '}
                  <icons.editIcon />{' '}
                </span>
              </button>
            </th>
            <th className='px-6 py-4 font-normal'>
              <input
                type='text'
                name='unpaidDays'
                id='unpaidDays'
                className={`bg-white w-6 outline-none ${editModes.unpaid ? 'underline' : ''}`}
                ref={el => (inputRefs.current[2] = el)}
                disabled={!editModes.unpaid}
                onChange={handleChangeForm}
                value={values.unpaidDays}
              />{' '}
              days per year
              <button className='ml-3 relative top-0.5' onClick={() => handleEditClick('unpaid')}>
                <span>
                  {' '}
                  <icons.editIcon />{' '}
                </span>
              </button>
            </th>
            <th className='px-6 py-4 font-normal'>
              <input
                type='text'
                name='bonusDays'
                id='bonusDays'
                className={`bg-white w-6 outline-none ${editModes.bonus ? 'underline' : ''}`}
                ref={el => (inputRefs.current[3] = el)}
                disabled={!editModes.bonus}
                onChange={handleChangeForm}
                value={values.bonusDays}
              />{' '}
              days per year
              <button className='ml-3 relative top-0.5' onClick={() => handleEditClick('bonus')}>
                <span>
                  {' '}
                  <icons.editIcon />{' '}
                </span>
              </button>
            </th>
          </tr>
        </tbody>
      </table>
      <table className='w-[1000px] text-sm text-left rtl:text-right text-gray-500 border-b border-gray-100 mb-[50px]'>
        <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
          <tr>
            <th scope='col' className='px-6 font-semibold py-3 text-[#333] text-[14px]'>
              Balance
            </th>
            <th scope='col' className='px-6 py-3 font-medium relative right-5'>
              <icons.vacationCircle
                style={{ width: '16px', height: '16px', position: 'relative', top: '19px', right: '25px' }}
              />
              <p>Vacation</p>
            </th>
            <th scope='col' className='px-6 py-3 font-medium relative left-4'>
              <icons.sickCircle
                style={{ width: '16px', height: '16px', position: 'relative', top: '19px', right: '25px' }}
              />
              <p>Sick Leave</p>
            </th>
            <th scope='col' className='px-6 py-3 font-medium relative left-4'>
              <icons.unpaidCircle
                style={{ width: '16px', height: '16px', position: 'relative', top: '19px', right: '25px' }}
              />
              <p>Unpaid Leave</p>
            </th>
          </tr>
        </thead>
        <tbody className='text-[12px] text-[#333]'>
          <tr className='bg-white'>
            <th className='px-6 py-4 font-semibold text-[#333] text-[14px]'>{currentYear}</th>
            <th className='px-6 py-4 font-normal'>{allowedDays.availableVacationDays}</th>
            <th className='px-6 py-4 font-normal relative left-4'>{allowedDays.availableSickDays}</th>
            <th className='px-6 py-4 font-normal relative left-7'>{allowedDays.availableUnpaidDays}</th>
          </tr>
        </tbody>
      </table>
      <table className='w-[1000px] text-sm text-left rtl:text-right text-gray-500 border-b border-gray-100 mb-[50px]'>
        <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
          <tr>
            <th scope='col' className='px-6 font-semibold py-3 text-[#333] text-[14px]'>
              Used
            </th>
            <th scope='col' className='px-6 py-3 font-medium relative left-5'>
              <icons.vacationCircle
                style={{ width: '16px', height: '16px', position: 'relative', top: '19px', right: '25px' }}
              />
              <p>Vacation</p>
            </th>
            <th scope='col' className='px-6 py-3 font-medium relative left-11'>
              <icons.sickCircle
                style={{ width: '16px', height: '16px', position: 'relative', top: '19px', right: '25px' }}
              />
              <p>Sick Leave</p>
            </th>
            <th scope='col' className='px-6 py-3 font-medium relative left-8'>
              <icons.unpaidCircle
                style={{ width: '16px', height: '16px', position: 'relative', top: '19px', right: '25px' }}
              />
              <p>Unpaid Leave</p>
            </th>
          </tr>
        </thead>
        <tbody className='text-[12px] text-[##333]'>
          <tr className='bg-white'>
            <th className='px-6 py-4 font-semibold text-[#333] text-[14px]'>{currentYear}</th>
            <th className='px-6 py-4 font-normal relative left-9'>{usedDays.usedVacationDays}</th>
            <th className='px-6 py-4 font-normal relative left-11'>{usedDays.usedSickDays}</th>
            <th className='px-6 py-4 font-normal relative left-11'>{usedDays.usedUnpaidDays}</th>
          </tr>
        </tbody>
      </table>
      {(editModes.vacation || editModes.sick || editModes.unpaid || editModes.bonus) && (
        <div className='mt-5'>
          <button
            className='px-[16px] py-[8px] absolute bottom-4 right-5 bg-[#4D4AEA] text-[#fff] rounded-md w-[315px]'
            onClick={() => handleSave()}
            disabled={loading}
          >
            {loading ? <SmallLoader tiny /> : 'Save vacation data'}
          </button>
          {error && (
            <span className='text-[#D0004B] mt-2 absolute max-w-[260px] text-[12px] flex text-left items-center'>
              <span className='mr-[5px]'>
                {' '}
                <icons.alert />{' '}
              </span>{' '}
              {error}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default VacationAllowance;
