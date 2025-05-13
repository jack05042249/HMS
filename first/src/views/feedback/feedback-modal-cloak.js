import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import FeedbackModal from './feedback-modal';
import history from '../../utils/browserHistory';
import { useDispatch, useSelector } from 'react-redux';
import { pushQuestionsData, updateUser } from '../../store/actionCreator';
import config from '../../config';
import PageStartLoader from '../loaders/PageStartLoader';
import { localStorageHelper } from '../../utils/localStorage';

const API_URL = config.API_URL;

const withTokenValidation = (WrappedComponent) => {
  return (props) => {
    const { user } = useSelector(state => state)
    const storageToken = localStorageHelper.getItem("token");
    const dispatch = useDispatch();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const auth = searchParams.get('auth');
    const [loading, setLoading] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true)
        try {
          if (!storageToken) {
            const userRes = await axios.get(`${API_URL}/getAuthUser`, { headers: { Authorization: `${auth}` } });
            if (userRes.status === 200) {
              dispatch(updateUser(userRes.data));
              localStorageHelper.setItem("token", auth)
              localStorageHelper.setItem("type", userRes.data.type)
            }
          }
          const { data: { isValid } } = await axios.post(`${API_URL}/feedback/checkToken`, { token }, { headers: { Authorization: `${auth}` } });
          setIsValidToken(isValid);

          const feedbackQuestionsRes = await axios.get(`${API_URL}/feedback/questions`, { headers: { Authorization: `${auth}` } }) ;
          dispatch(pushQuestionsData(feedbackQuestionsRes.data));

          history.push(`/talent/feedback?token=${token}&auth=${auth}`);
          setLoading(false);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      if (token) {
        fetchData();
      } else {
        setLoading(false);
      }
    }, [token, dispatch]);

    if (loading) {
      return <PageStartLoader />;
    } else if (!isValidToken) {
      history.push('/talent/profile');
      return null;
    } else {
      return <WrappedComponent {...props} />;
    }
  };
};

const FeedbackModalWithTokenValidation = withTokenValidation(FeedbackModal);

export default FeedbackModalWithTokenValidation;
