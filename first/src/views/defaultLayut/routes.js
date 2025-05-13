import { lazy } from 'react';
const Dashboard = lazy(() => import('../dashboard/Dashboard'));
const Organizations = lazy(() => import('../organizations/Organizations'));
const Customers = lazy(() => import('../customers/Stakeholders'));
const Talents = lazy(() => import('../talents/Talents'));
const Settings = lazy(() => import('../settings/Settings'));
const Agency = lazy(() => import('../agency/agency'));
const Feedback = lazy(() => import('../feedback/feedback'));
const Reports = lazy(() => import('../reports/reports'));
const Tasks = lazy(() => import('../tasks/Tasks'));

const routes = [
  {
    path: '/dashboard',
    Component: Dashboard,
    name: 'Dashboard'
  },
  {
    path: '/organizations',
    Component: Organizations,
    name: 'Organizations'
  },
  {
    path: '/customers',
    Component: Customers,
    name: 'Customers'
  },
  {
    path: '/talents',
    Component: Talents,
    name: 'Talents'
  },
  {
    path: '/settings',
    Component: Settings,
    name: 'Settings'
  },
  {
    path: '/agencies',
    Component: Agency,
    name: 'Agency'
  },
  {
    path: '/feedback',
    Component: Feedback,
    name: 'Feedback'
  },
  {
    path: '/reports',
    Component: Reports,
    name: 'Reports'
  },
  {
    path: '/tasks',
    Component: Tasks,
    name: 'Tasks'
  }
];

export default routes;
