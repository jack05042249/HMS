import React, { Suspense, useLayoutEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PageStartLoader from '../loaders/PageStartLoader'
import { useDispatch } from 'react-redux'
import {
    localStorageHelper
} from '../../utils/localStorage';
import history from '../../utils/browserHistory'
import { handleError } from '../../utils/handleError'
import axios from 'axios'
import config from '../../config'
import mountingDelay from '../../utils/mountingDelay'
import { addCountries, pushAgency, pushQuestionsData, setInitialData } from '../../store/actionCreator';
import SideBar from '../sideBar/SideBar'
import routes from './routes'
import MessageNotification from '../components/messageNotiffication/MessageNotification'

const API_URL = config.API_URL

const DefaultLayout = (props) => {
    const dispatch = useDispatch()
    const userType = localStorageHelper.getItem("type")

    useLayoutEffect(() => {
        const fetchData = async () => {
            const token = localStorageHelper.getItem("token")
            if (!token) {
                history.push('/login')
                return
            }
            const userRes = axios.get(`${API_URL}/getUser`);
            try {
                if (userType === 'admin') {
                    const customersRes = axios.get(`${API_URL}/customers`);
                    const organizationsRes = axios.get(`${API_URL}/organizations`);
                    const talentsRes = axios.get(`${API_URL}/getAggregatedTalents`);
                    const agencyRes = await axios.get(`${API_URL}/agency`);
                    dispatch(pushAgency(agencyRes.data));
                    const feedbackQuestionsRes = await axios.get(`${API_URL}/feedback/questions`)
                    dispatch(pushQuestionsData(feedbackQuestionsRes.data));
                    const [userInfo, customersInfo, talentsInfo, organizationsInfo] = await Promise.all([userRes, customersRes, talentsRes, organizationsRes]);
                    dispatch(setInitialData({ ...userInfo.data, ...customersInfo.data, ...talentsInfo.data, ...organizationsInfo.data }));

                    const getCountries = await axios.get(`${API_URL}/common/countries`);

                    dispatch(addCountries(getCountries.data));
                 } else {
                    const [userInfo] = await Promise.all([userRes]);
                    dispatch(setInitialData({...userInfo.data}))
                    history.push('/talent/profile');
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
    }, [dispatch])

    return (
      // <div className="bg-[#FAFBFF] min-h-screen flex">
      <div className="bg-[#FAFBFF] min-h-screen flex">
              <SideBar userType={userType}/>
          {/*<div className="px-[35px] pt-[25px] pb-[60px] bg-[#FAFBFF]">*/}
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
                          <Route path="/*" element={<Navigate replace to="/dashboard" />} />
                      </Routes>
                  </Suspense>
              </section>
            <MessageNotification />
        </div>
    )
}

export default DefaultLayout
