import icons from '../../icons';
import GenericModal from '../components/modal/GenericModal';
import React, { useState } from 'react';
import axios from 'axios';
import { updateSingleAggregatedTalent } from '../../store/actionCreator';
import { showNotificationSuccess } from '../../utils/notifications';
import { useDispatch } from 'react-redux';
import { objectToFormData } from '../../utils/objectToFormData';
const UpdatePassword = ({ closeModal, displayModal, talentToEdit, API_URL }) => {
  const [talent, setTalent] = useState(talentToEdit);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const initValues = {
    password: '',
    confirmPassword: ''
  };

  const initState = { values: initValues };
  const [formState, setFormState] = useState(initState);

  const { values } = formState;

  const handleChangeForm = ({ target }) =>
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [target.name]: target.value
      }
    }));
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = password => {
    if (password.length < 8 || password.length > 16) {
      setError('Password must be between 8 and 16 characters');
      return false;
    }
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSymbol = /[@$!%*?&]/.test(password);
    if (!hasLowerCase || !hasUpperCase || !hasSymbol) {
      setError('Password must contain at least 1 lowercase letter, 1 uppercase letter, and 1 special character');
      return false;
    }
    return true;
  };

  const updatePassword = async () => {
    try {
      if (!validatePassword(values.password)) {
        return;
      }

      if (values.password !== values.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const data = {
        ...talent,
        password: values.password
      };
      const response = await axios.put(`${API_URL}/talent`, objectToFormData(data));

      if (response.status >= 200 && response.status <= 300) {
        showNotificationSuccess('Password updated successfully.');

        setFormState({ values: initValues });
        setError('');
        closeModal();
      }
    } catch (error) {
      setError('Failed to save data. Please try again.');
    }
  };

  return (
    <GenericModal closeModal={closeModal} displayModal={displayModal}>
      <div className='px-[50px]'>
        <div className='flex justify-start items-center'>
          <span className='mr-5'>
            {' '}
            <icons.biggerLockIcon />{' '}
          </span>
          <h1 className='text-[#333] text-[20px] font-medium'>Update Password</h1>
        </div>
        <div className='flex mt-10 text-[12px]'>
          <div className='flex flex-col mr-[35px]'>
            <label htmlFor='password' className='text-[#000] text-[14px] font-medium text-left mb-1'>
              New Password
            </label>
            {showPassword ? (
              <span className='relative left-[280px] max-w-[50px] top-[28px] cursor-pointer'>
                {' '}
                <icons.hiddenPasswordIcon
                  style={{ width: '20px', height: '20px' }}
                  onClick={togglePasswordVisibility}
                />{' '}
              </span>
            ) : (
              <span className='relative left-[280px] top-[28px] max-w-[50px] cursor-pointer'>
                {' '}
                <icons.visiblePasswordIcon
                  style={{ width: '20px', height: '20px' }}
                  onClick={togglePasswordVisibility}
                />{' '}
              </span>
            )}
            <input
              type={showPassword ? 'text' : 'password'}
              id='password'
              name='password'
              value={values.password}
              onChange={handleChangeForm}
              placeholder='***'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            {error && (
              <p className='text-[#D0004B] text-[10px] max-w-[300px] flex items-center'>
                <span className='mr-[5px]'>
                  {' '}
                  <icons.alert />{' '}
                </span>{' '}
                {error}
              </p>
            )}
          </div>
          <div className='flex flex-col'>
            <label htmlFor='confirmPassword' className='text-[#000] text-[14px] font-medium text-left mb-1'>
              Repeat Password
            </label>
            {showConfirmPassword ? (
              <span className='relative left-[280px] top-[28px] max-w-[50px] cursor-pointer'>
                {' '}
                <icons.hiddenPasswordIcon
                  style={{ width: '20px', height: '20px' }}
                  onClick={toggleConfirmPasswordVisibility}
                />{' '}
              </span>
            ) : (
              <span className='relative left-[280px] top-[28px] max-w-[50px] cursor-pointer'>
                {' '}
                <icons.visiblePasswordIcon
                  style={{ width: '20px', height: '20px' }}
                  onClick={toggleConfirmPasswordVisibility}
                />{' '}
              </span>
            )}
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id='confirmPassword'
              name='confirmPassword'
              value={values.confirmPassword}
              onChange={handleChangeForm}
              placeholder='***'
              className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
            />
            <div className='flex items-center justify-start mt-2'>
              <button
                onClick={() => closeModal()}
                className='w-[145px] px-[16px] mr-2.5 py-[8px] border-[#E0E0E0] border rounded-md font-medium text-[#020202] text-[14px]'
              >
                Cancel
              </button>
              <button
                onClick={() => updatePassword()}
                className='px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[160px] text-[14px] text-[#fff]'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </GenericModal>
  );
};

export default UpdatePassword;
