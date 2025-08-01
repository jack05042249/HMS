import { useState } from 'react';
import moment from 'moment/moment';

import { TableHeaderItem } from '../tasks/TableHeaderItem';
import { TableCell } from '../tasks/TableCell';
import PageStartLoader from '../loaders/PageStartLoader';
import { useSelector } from 'react-redux';
import config from '../../config';
import EditTalentModal from '../talents/EditTalentModal';
import {NoLinkedinFilterWidget} from './NoLinkedinFilterWidget'

const NoLinkedinReport = () => {
  const [editTalentId, setEditTalentId] = useState();
  const { aggregatedTalents, organizations, customers, agencies } = useSelector(state => state);

  const [ignore, setIgnore] = useState(false);

  const getRelevantTalent = id => {
    return aggregatedTalents.find(cus => +cus.id === +id) || {};
  };

  const getRelevantCustomer = id => {
    return customers.find(cus => cus.id === id) || {};
  };

  const getRelevantOrganization = id => {
    return organizations.find(org => +org.id === +id);
  };

  return (
    <div>
      <div className='mx-6 my-3'>
        <NoLinkedinFilterWidget type={ignore} onApplyType={setIgnore} />
      </div>
      <table className='w-full text-sm text-left rtl:text-right text-gray-500' id={`employees_table`}>
        <thead className='text-[12px] text-gray-700 border-b border-gray-100'>
          <tr>
            <TableHeaderItem>№</TableHeaderItem>
            <TableHeaderItem>Talent</TableHeaderItem>
            <TableHeaderItem>Last Check Date</TableHeaderItem>
            <TableHeaderItem>Linkedin Comment</TableHeaderItem>
          </tr>
        </thead>
        <tbody className='text-[12px]'>
          {aggregatedTalents && aggregatedTalents.length > 0 ? (aggregatedTalents
            .filter(item => (!item.linkedinProfileChecked || !item.linkedinProfile) && item.agencyName === 'Commit Offshore' && item.inactive === false && item.ignoreLinkedinCheck === ignore)
            .map((item, index) => (
              <tr key={item.id} className='bg-white border-b border-gray-100 text-[#9197B3]'>
                <TableCell className='whitespace-nowrap'>{index + 1}</TableCell>
                <TableCell className='whitespace-nowrap' onClick={() => setEditTalentId(item.id)}>
                  {item.fullName}
                </TableCell>
                <TableCell className='whitespace-nowrap'>
                  {item.linkedinProfileDate ? moment(item.linkedinProfileDate).format('DD/MM/YYYY') : '-'}
                </TableCell>
                <TableCell className='whitespace-nowrap'>{item.linkedinComment ? item.linkedinComment : '-'}</TableCell>
              </tr>
            ))) : ( <PageStartLoader />)}
        </tbody>
      </table>
      {!!editTalentId && (
        <EditTalentModal
          agencies={agencies}
          displayModal={!!editTalentId}
          closeModal={() => setEditTalentId()}
          talentToEdit={getRelevantTalent(editTalentId)}
          getRelevantCustomer={getRelevantCustomer}
          customers={customers}
          getRelevantOrganization={getRelevantOrganization}
          API_URL={config.API_URL}
        />
      )}
    </div>
  );
};

export { NoLinkedinReport };