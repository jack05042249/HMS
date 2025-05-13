import React, { useState } from 'react';
import history from '../../utils/browserHistory';
import SmallLoader from '../loaders/SmallLoader';
import { useDispatch, useSelector } from 'react-redux';
import config from '../../config';
import axios from 'axios';
import { localStorageHelper } from '../../utils/localStorage';
import { updateUser } from '../../store/actionCreator';
import icons from '../../icons';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState({ email: '', password: '', type: 'admin' });
    const [error, setError] = useState('');
    const token = localStorageHelper.getItem("token");
    const type = localStorageHelper.getItem("type");

    if (token && type) {
        history.push('/dashboard');
    }

    const dispatch = useDispatch();

    const loginUser = async (e) => {
        try {
            e.preventDefault();
            setLoading(true);
            setError('');
            const { data: loggedUser } = await axios.post(`${config.API_URL}/login`, credentials);
            localStorageHelper.setItem('token', loggedUser.token);
            dispatch(updateUser(loggedUser));
            setLoading(false);
            localStorageHelper.setItem('type', credentials.type)
            history.push('/dashboard');
        } catch (error) {
            setLoading(false);
            if (error.response.status === 404) {
                setError("Not found data. Correct your credentials");
            } else if (error.response.status === 400) {
                setError("Invalid email or password")
            }
        }
    };

    const onChangeHandler = (e) => {
        const { id, value } = e.target;
        setCredentials((state) => ({ ...state, [id]: value }));
    };

    return (
      <div className="flex bg-[#FAFBFF]">
          <div>
              <img
                src='/ITSOFT_NEW_LOGO.png'
                alt='ITSOFT_LOGO'
                className="absolute bottom-[600px] left-[150px] w-[280px] h-[82px]"
              />
              <img
                src='/LOGIN_IMAGE.png'
                alt='ITSOFT_LOGIN_IMAGE'
                className="min-h-[700px] max-h-screen max-w-[800px]"
              />
          </div>
          <div className="mx-[15rem] my-[8rem]">
              <h1 className="text-[#333] text-[28px] font-semibold text-left my-[2rem]">Log In as Admin With</h1>
              <p className="text-[#9197B3] text-[16px] text-left mb-[5px]">Please fill your information bellow</p>
              <form onSubmit={loginUser}>
                  <div>
                      <div className="relative top-[42px] left-[15px] w-[20px] h-[20px]">
                          <icons.mail/>
                      </div>
                      <input
                        className='bg-[#F5F5F7] rounded-[10px] w-[444px] h-[64px] focus:outline-none font-[#8B8FA8] font-[16px] pl-[50px]'
                        type='email'
                        id='email'
                        name='email'
                        autoComplete='name'
                        placeholder='E-mail'
                        onChange={onChangeHandler}
                      />
                  </div>
                  <div className="mb-[20px]">
                      <div className="relative top-[40px] left-[15px] w-[20px] h-[20px]">
                          <icons.password/>
                      </div>
                      <input
                        className='bg-[#F5F5F7] rounded-[10px] w-[444px] h-[64px] focus:outline-none font-[#8B8FA8] font-[16px] pl-[50px]'
                        type='password'
                        id='password'
                        name='password'
                        placeholder='********'
                        autoComplete='current-password'
                        onChange={onChangeHandler}
                      />
                  </div>
                  {error && <p className='red'>{error}</p>}
                  <div className='input_wrapper'>
                      <button type='submit' className='flex justify-center w-[444px] h-[64px] py-[17px] items-center rounded-[8px] bg-[#4D4AEA] text-[#FFF] text-[20px] font-semibold'
                              disabled={loading || !credentials.email || !credentials.password}>
                          {loading ? <SmallLoader tiny /> : 'Log In'}
                      </button>
                  </div>
              </form>
          </div>
      </div>
    );
};

export default Login;
