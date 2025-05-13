import { useCallback } from 'react';
import { useSelector } from 'react-redux';

const useGetTalent = () => {
  const aggregatedTalents = useSelector(state => state.aggregatedTalents);
  return useCallback(id => aggregatedTalents.find(talent => `${talent.id}` === `${id}`), [aggregatedTalents]);
};

export { useGetTalent };
