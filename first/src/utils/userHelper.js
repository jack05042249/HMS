import { localStorageHelper } from './localStorage';

export const getIsAdmin = () => {
  const userType = localStorageHelper.getItem('type');
  return userType === 'admin';
};
