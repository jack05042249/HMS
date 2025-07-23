import { useRef, useState } from 'react';
import icons from '../../icons';
import LeavesAndAnnualSituation from './leavesAndAnnualSituation';
import { TasksReport } from './TasksReport';
import { SatisfactionReport } from './SatisfactionReport';
import { NoLinkedinReport } from './NoLinkedinReport';
import { getIsAdmin } from '../../utils';

const Types = ({ type, onChange }) => {
  const isAdminUser = getIsAdmin();

  return (
    <div className='flex justify-start border-2 border-[#4D4AEA] rounded-md  ml-[20px] w-fit mb-5 font-medium'>
      <button
        onClick={() => onChange('monthly')}
        className={type === 'monthly' ? 'text-[#fff] bg-[#4D4AEA] px-[60px] py-3' : 'px-[60px] py-3 text-[#4D4AEA]'}
      >
        Leaves
      </button>
      <button
        onClick={() => onChange('year')}
        className={type === 'year' ? 'text-[#fff] bg-[#4D4AEA]  px-9 py-3' : 'px-9 py-3 text-[#4D4AEA]'}
      >
        Annual Situation
      </button>
      {isAdminUser && (
        <>
          <button
            onClick={() => onChange('tasks')}
            className={type === 'tasks' ? 'text-[#fff] bg-[#4D4AEA]  px-9 py-3' : 'px-9 py-3 text-[#4D4AEA]'}
          >
            Tasks
          </button>
          <button
            onClick={() => onChange('satisfaction')}
            className={type === 'satisfaction' ? 'text-[#fff] bg-[#4D4AEA]  px-9 py-3' : 'px-9 py-3 text-[#4D4AEA]'}
          >
            Satisfaction
          </button>
          <button
            onClick={() => onChange('linkedin')}
            className={type === 'linkedin' ? 'text-[#fff] bg-[#4D4AEA]  px-9 py-3' : 'px-9 py-3 text-[#4D4AEA]'}
          >
            No Linkedin
          </button>
        </>
      )}
    </div>
  );
};

const Reports = () => {
  const [type, setType] = useState('linkedin');

  const ref = useRef();

  const handleOnTypeChange = type => {
    if (ref.current?.isLoading) {
      return;
    }
    setType(type);
  };

  const getTaskComponent = type => {
    const map = {
      monthly: <LeavesAndAnnualSituation type={type} ref={ref} />,
      year: <LeavesAndAnnualSituation type={type} ref={ref} />,
      tasks: <TasksReport />,
      satisfaction: <SatisfactionReport />,
      linkedin: <NoLinkedinReport />,
    };
    return map[type];
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <span className='w-[24px] h-[24px]'>
            <icons.reportIcon style={{ width: '29px', height: '29px' }} />
          </span>
          <p className='text-[#333] text-[24px]  font-semibold leading-9 ml-3'>Reports</p>
        </div>
      </div>
      <div className='bg-[#FFF] w-full mt-5 h-fit shadow-md rounded-lg py-[35px]'>
        <Types type={type} onChange={handleOnTypeChange} />
        {getTaskComponent(type)}
      </div>
    </div>
  );
};

export default Reports;
