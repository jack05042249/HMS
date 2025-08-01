import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment/moment';

import { TableHeaderItem } from '../tasks/TableHeaderItem';
import { TableCell } from '../tasks/TableCell';
import PageStartLoader from '../loaders/PageStartLoader';
import { RISK } from '../../utils';
import icons from '../../icons';
import config from '../../config';
import { SatisfactionFilterWidget } from './SatisfactionFilterWidget';
import GenericModal from '../components/modal/GenericModal';
import { ObjectTasks } from '../tasks/ObjectTasks';

const SatisfactionReport = () => {
  const [data, setData] = useState({ stakeHolder: [], talent: [] });

  const [isLoading, setIsLoading] = useState(false);

  const [stakeholderDialog, setStakeholderDialog] = useState(null);

  const updateSatisfactionList = useCallback(() => {
    const abortController1 = new AbortController();
    const abortController2 = new AbortController();

    setIsLoading(true);

    Promise.all([
      axios.get(`${config.API_URL}/tasks-customer-satisfication`, { signal: abortController1.signal }),
      axios.get(`${config.API_URL}/tasks-talent-satisfication`, { signal: abortController2.signal })
    ])
      .then(([{ data: stakeHolderData }, { data: talentData }]) => {
        setData({
          stakeHolder: stakeHolderData,
          talent: talentData
        });
      })
      .finally(() => setIsLoading(false));
    return [abortController1, abortController2];
  }, []);

  useEffect(() => {
    const abortControllers = updateSatisfactionList();
    return () => {
      abortControllers.forEach(controller => controller.abort());
    };
  }, [updateSatisfactionList]);

  const [type, setType] = useState('talent');

  if (isLoading) {
    return <PageStartLoader />;
  }

  return (
    <div>
      <div className='mx-6 my-3'>
        <SatisfactionFilterWidget type={type} onApplyType={setType} />
      </div>
      {type === 'talent' ? (
        <table className='w-full text-sm text-left rtl:text-right text-gray-500' id={`employees_table`}>
          <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
            <tr>
              <TableHeaderItem>№</TableHeaderItem>
              <TableHeaderItem>Talent</TableHeaderItem>
              <TableHeaderItem>Last Contact Date</TableHeaderItem>
              <TableHeaderItem>Next Contact Date</TableHeaderItem>
              <TableHeaderItem>Risk</TableHeaderItem>
            </tr>
          </thead>
          <tbody className='text-[12px]'>
            {data.talent.map((item, index) => {
              return (
                <>
                  <tr key={item.id} className='bg-white border-b border-gray-100 text-[#9197B3]'>
                    <TableCell className='whitespace-nowrap'>{index + 1}</TableCell>
                    <TableCell className='whitespace-nowrap'>{item.Talent.fullName}</TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.lastContactDate ? moment(item.lastContactDate).format('DD/MM/YYYY') : '-'}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.nextContactDate ? moment(item.nextContactDate).format('DD/MM/YYYY') : '-'}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      <span className={RISK[item.risk].color}>{RISK[item.risk].label}</span>
                    </TableCell>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      ) : (
        <table className='w-full text-sm text-left rtl:text-right text-gray-500' id={`employees_table`}>
          <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
            <tr>
              <TableHeaderItem>№</TableHeaderItem>
              <TableHeaderItem>Stakeholder</TableHeaderItem>
              <TableHeaderItem>Customer</TableHeaderItem>
              <TableHeaderItem>Last Contact Date</TableHeaderItem>
              <TableHeaderItem>Next Contact Date</TableHeaderItem>
              <TableHeaderItem>Risk</TableHeaderItem>
            </tr>
          </thead>
          <tbody className='text-[12px]'>
            {data.stakeHolder.map((item, index) => {
              return (
                <>
                  <tr key={item.id} className='bg-white border-b border-gray-100 text-[#9197B3]'>
                    <TableCell className='whitespace-nowrap'>{index + 1}</TableCell>
                    <TableCell
                      onClick={() => setStakeholderDialog(item)}
                      className='whitespace-nowrap justify-end cursor-pointer text-[#020202] hover:underline'
                    >
                      {item['Customer.fullName']}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>{item['Customer.Organization.name']}</TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.csLastContactDate ? moment(item.csLastContactDate).format('DD/MM/YYYY') : '-'}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.csNextContactDate ? moment(item.csNextContactDate).format('DD/MM/YYYY') : '-'}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      <span className={RISK[item.risk].color}>{RISK[item.risk].label}</span>
                    </TableCell>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      )}
      {stakeholderDialog && (
        <GenericModal displayModal={!!stakeholderDialog} closeModal={() => setStakeholderDialog(null)}>
          <div className='pl-5 relative' id='single_customer'>
            <div className='flex justify-between items-center mb-5 pr-5 border-b border-[#9197B333] pb-8'>
              <div className='flex text-[#333] text-[20px] font-medium mt-2'>
                <span className='mr-3'>
                  <icons.userEditIcon />
                </span>
                {stakeholderDialog['Customer.fullName']} (Tasks)
              </div>
            </div>
            <div className='mt-[1.5rem]'>
              <ObjectTasks id={stakeholderDialog.customerId} type='customer' />
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  );
};

export { SatisfactionReport };
