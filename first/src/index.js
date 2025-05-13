import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { configureStore } from '@reduxjs/toolkit';
import reducer from './store/reducer'
import { Provider } from 'react-redux';
import axiosInstance from './utils/axiosInstance';

const APP_ENV = process.env.NODE_ENV;
if (process.env.NODE_ENV !== 'production') {
  console.log('APP_ENV: ', process.env);
} else {
  console.warn('Running in production mode');
}


global.APP_ENV = APP_ENV;

const store = configureStore({ reducer, devTools: true });
axiosInstance.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
