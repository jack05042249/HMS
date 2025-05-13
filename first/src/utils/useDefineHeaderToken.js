import { localStorageHelper } from './localStorage';
import history from '../utils/browserHistory';

export const useDefineHeaderToken = (axios) => {
  axios.defaults.headers.common["Authorization"] = localStorageHelper.getItem("token");

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 403 || error.response.status === 401) {
        console.error("Error:", error.response.data);
        localStorageHelper.clear();
        history.push("/login");
      }
      return Promise.reject(error);
    }
  );
};
