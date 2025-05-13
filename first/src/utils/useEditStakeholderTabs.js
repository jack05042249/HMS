import { useState } from 'react';

import { getIsAdmin } from './userHelper';

const isAdminUser = getIsAdmin();

const tabs = ['Personal Details'];

if (isAdminUser) {
  tabs.push('Tasks');
}

export const useEditStakeholderTabs = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return { activeTab, setActiveTab, tabs };
};
