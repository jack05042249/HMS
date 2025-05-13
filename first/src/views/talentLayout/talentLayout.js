import React, { Suspense, useLayoutEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom'
import PageStartLoader from '../loaders/PageStartLoader'
import { useDispatch } from 'react-redux';
import {
  localStorageHelper
} from '../../utils/localStorage';
import history from '../../utils/browserHistory'
import { handleError } from '../../utils/handleError'
import axios from 'axios'
import config from '../../config'
import mountingDelay from '../../utils/mountingDelay'
import { setInitialData } from '../../store/actionCreator'
import SideBar from '../sideBar/SideBar'
import routes from './routes'
import MessageNotification from '../components/messageNotiffication/MessageNotification'

const API_URL = config.API_URL

const TalentLayout = (props) => {
  const dispatch = useDispatch()
  const userType = localStorageHelper.getItem("type")

  useLayoutEffect(() => {
    const fetchData = async () => {
      const token = localStorageHelper.getItem("token")
      const currentPath = window.location.pathname;
      if (currentPath === '/talent/feedback') {
        return;
      }
      if (!token) {
        history.push('/talent/login')
        return
      }
      const userRes = axios.get(`${API_URL}/getUser`);
      try {
        if (userType === 'talent') {
          const [userInfo] = await Promise.all([userRes]);
          dispatch(setInitialData({ ...userInfo.data }));
        } else if (userType === 'admin') {
          history.push('/dashboard');
        } else {
          const [userInfo] = await Promise.all([userRes]);
          dispatch(setInitialData({...userInfo.data}))
          history.push('/login');
        }
      } catch (error) {
        handleError(error, dispatch, history);
        console.error(error);
      }
    };
    const userType = localStorageHelper.getItem('type');
    const id = mountingDelay(fetchData)
    return () => {
      clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-[#FAFBFF] min-h-screen flex">
        <SideBar userType={userType}/>
      <section className="p-4 sm:ml-72 w-full bg-[#f5f8fd] w-full">
        <Suspense fallback={<PageStartLoader />}>
          <Routes>
            {routes.map(route => {
              const { name, path, Component } = route
              return Component ? (
                <Route
                  exact={true}
                  key={name}
                  name={name}
                  path={path}
                  element={
                    <Component {...props} API_URL={API_URL} axios={axios} />
                  }
                />
              ) : null;
            })}
            <Route path="/*" element={<Navigate replace to="/talent/profile" />} />
          </Routes>
        </Suspense>
      </section>
        <MessageNotification />
    </div>
  )
}

export default TalentLayout
