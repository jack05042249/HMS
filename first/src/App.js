import React, { lazy, useLayoutEffect, useState } from 'react';
import './App.scss';
import history from './utils/browserHistory';
import { Route, Router, Routes } from 'react-router-dom';
import PageStartLoader from './views/loaders/PageStartLoader';
import { useDefineHeaderToken } from './utils/useDefineHeaderToken';
import axios from 'axios';
import TalentLogin from './views/login/TalentLogin';
import TalentResetPassword from './views/login/TalentResetPassword';
import TalentLayout from './views/talentLayout/talentLayout';


const Login = lazy(() => import('./views/login/Login'));
const DefaultLayout = lazy(() => import('./views/defaultLayut/DefaultLayout'));


function App() {

  const [state, setState] = useState({
    action: history.action,
    location: history.location
  });
  useDefineHeaderToken(axios)

  useLayoutEffect(() => history.listen(setState), []);

  return (
    <div className='App'>
      <Router navigator={history} location={state.location} navigationType={state.action} basename={'/'}>
        <React.Suspense fallback={<PageStartLoader />}>
          <Routes>
            <Route name="Talent login" path="/talent/login" element={<TalentLogin/>}/>
            <Route name="Talent Reset Password" path="/talent/reset-password" element={<TalentResetPassword/>}/>
            <Route name="Talent home" path="/talent/*" element={<TalentLayout/>} />
            <Route exact path="/login" name="Login Page" element={<Login />} />
            <Route path="/*" name="Home" element={<DefaultLayout />} />
          </Routes>
        </React.Suspense>
      </Router>
    </div>
  );
}

export default App;
