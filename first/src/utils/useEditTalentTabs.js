import { useState } from 'react';

import { getIsAdmin } from './userHelper';

const isAdminUser = getIsAdmin();

const tabs = ['Personal Details', 'Vacation Allowance'];

if (isAdminUser) {
  tabs.push('Feedbacks', 'Tasks');
}

export const useEditTalentTabs = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return { activeTab, setActiveTab, tabs };
};
