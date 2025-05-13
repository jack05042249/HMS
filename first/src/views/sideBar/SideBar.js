import React from 'react';
import history from '../../utils/browserHistory';
import { localStorageHelper } from '../../utils/localStorage';
import icons from '../../icons';

const adminNavElements = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: <icons.dashboardInactive/>,
        activeIcon: <icons.dashboard/>
    },
    {
        id: 'customers',
        title: 'Stakeholders',
        icon:  <icons.customerInactive/>,
        activeIcon: <icons.customersActive/>
    },
    {
        id: 'talents',
        title: 'Employees',
        icon: <icons.employeeInactive/>,
        activeIcon: <icons.employeeActive/>
    },
    {
        id: 'reports',
        title: 'Reports',
        icon: <icons.reportInactive/>,
        activeIcon: <icons.reportActive/>
    },
    {
         id: 'organizations',
         title: 'Customers',
         icon: <icons.orgzInactive/>,
         activeIcon: <icons.orgzActive/>
    },
    {
      id: 'agencies',
      title: 'Agency',
      icon: <icons.orgzInactive/>,
      activeIcon: <icons.orgzActive/>
    },
    {
      id: 'feedback',
      title: 'Feedback',
      icon: <icons.feedbackInactive/>,
      activeIcon: <icons.feedbackActive/>
    },
    {
      id: 'tasks',
      title: 'Tasks',
      icon: <icons.tasksActive/>,
      activeIcon: <icons.tasksInactive/>
    },
];

const talentNavElements = [
  {
    id: 'talent/profile',
    title: 'My Account',
    icon: null,
    activeIcon: <icons.user />
  }
];

const SideBar = ({ userType }) => {
  const clickHandler = (e) => {
    const { id } = e.currentTarget;
    history.push(`/${id}`);
  };
  const logout = () => {
    localStorageHelper.clear();
    if (userType === 'admin') {
      history.push('/login');
    } else {
      history.push('/talent/login');
    }
  };
  const STAGE_API = process.env.REACT_APP_API_URL;
  const APP_MODE = STAGE_API ? 'stage' : (process.env.NODE_ENV || 'development');

  const navigationElements = userType === 'talent' ? talentNavElements : adminNavElements;

  return (
    <aside className='fixed top-0 left-0 xl:w-64 2xl:w-72 h-screen'>
      <div className='h-full pl-5 pt-5'>
        <div className='w-[178px]'>
          <img src="/ITSOFT_NEW_LOGO.png"
                 alt='logo' className='' />
        </div>
        <nav className='my-[30px] pr-5'>
          {navigationElements.map((el) => {
            const { id, title, icon, activeIcon } = el;
            return (
              <div
                key={id}
                onClick={clickHandler}
                className={`flex my-2 px-[16px] py-[12px] items-center rounded-[6px] ${id === history.location.pathname.slice(1) ? 'bg-[#4D4AEA] text-white' : 'bg-none text-[#9197B3]'}`}
                id={id}
              >
                <span className='mr-2'>{id === history.location.pathname.slice(1) ? activeIcon : icon}</span>
                <span className='pointer font-medium text-[16px]'>{title}</span>
              </div>
            );
          })}
        </nav>

        {
          APP_MODE !== 'production' ? <span>
          Running in <i>{APP_MODE}</i> mode
        </span> : null
        }


        <div className='w-full h-[1px] bg-[#F0F0F0] mt-5 mb-2'></div>
        <div className='flex items-center '>
          <span className='pl-4 mr-3'><icons.logout /></span>
          <button onClick={logout} className='text-[#9197B3] font-medium leading-10 text-[16px]'>Log Out</button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
