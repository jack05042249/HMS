import { useCallback } from 'react';
import { useSelector } from 'react-redux';

const useGetCustomer = () => {
  const customers = useSelector(state => state.customers);
  return useCallback(id => customers.find(customer => `${customer.id}` === `${id}`), [customers]);
};

export { useGetCustomer };
