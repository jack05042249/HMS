import { useCallback, useState } from 'react';

export const useToggle = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return [isOpen, toggle];
};
