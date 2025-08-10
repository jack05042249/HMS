import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { globalVacationHistoryPush } from '../../store/actionCreator';
import { useDispatch, useSelector } from 'react-redux';
import config from '../../config';
import icons from '../../icons';
import moment from 'moment';
import GenericModal from '../components/modal/GenericModal';
import EditTalentModal from '../talents/EditTalentModal';
import ConfirmReject from './confirm-reject';
import RequestEdit from './request-edit';

const API_URL = config.API_URL;

const VacationHistory = ({ displayModal, closeModal }) => {
  const [showTalentDetails, setShowTalentDetails] = useState()
  const [isDetailsOpened, setIsDetailsOpened] = useState(false)
  const [isEditRequest, setIsEditRequest] = useState()
  const [deleteRequestMenu, setDeleteRequestMenu] = useState(false)
  const [recordData, setRecordData] = useState()
  const [talName, setTalName] = useState()
  const [talId, setTalId] = useState()
  const dispatch = useDispatch()
  const { globalVacationHistory, aggregatedTalents, organizations, customers, agencies } = useSelector(state => state)
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const responseVacationHistory = await axios.get(`${API_URL}/vacation/approvedList`);
  //       dispatch(globalVacationHistoryPush(responseVacationHistory.data));
  //     } catch (error) {
  //       console.error('Error:', error);
  //     }
  //   };
  //   fetchData();
  // }, [dispatch]);

  const toggleDetails = (talId) => {
    setShowTalentDetails(talId);
    setIsDetailsOpened(!isDetailsOpened);
  };

  const toggleEditRequest = (record, name, id) => {
    setIsEditRequest(!isEditRequest)
    setRecordData(record)
    setTalId(id)
    setTalName(name)
  }

  const handleDeleteRequest = (record) => {
    setDeleteRequestMenu(!deleteRequestMenu);
    setRecordData(record)
  }


  const getRelevantTalent = (id) => {
    return aggregatedTalents.find(cus => +cus.id === +id) || {}
  }
  const getRelevantOrganization = (id) => {
    return organizations.find(org => +org.id === +id)
  }
  const getRelevantCustomer = (id) => {
    return customers.find(cus => cus.id === id) || {}
  }



  return (
    <>
      <GenericModal displayModal={displayModal} closeModal={closeModal}>
        {deleteRequestMenu && (
          <ConfirmReject
            requestData={recordData}
            onClose={() => setDeleteRequestMenu(false)}
            API_URL={API_URL}
          />
        )}
        {isEditRequest && (
          <RequestEdit
            talentId={talId}
            requestData={recordData}
            displayModal={!!isEditRequest}
            closeModal={() => setIsEditRequest(null)}
            API_URL={API_URL}
            fullName={talName}
          />
        )}
        {showTalentDetails && (
          <EditTalentModal
            agencies={agencies}
            displayModal={!!showTalentDetails}
            closeModal={() => setShowTalentDetails(null)}
            talentToEdit={getRelevantTalent(showTalentDetails)}
            getRelevantCustomer={getRelevantCustomer}
            customers={customers}
            getRelevantOrganization={getRelevantOrganization}
            API_URL={API_URL}
          />
        )}
        <p className="flex mb-10">
          <span className="mr-3"> <icons.calendarDotes/> </span>
          <h1 className="text-[#333] font-medium text-[20px] ">Registered Leaves</h1>
        </p>
        <div className="relative overflow-x-auto sm:rounded-lg w-full">
          <table className="w-full text-left rtl:text-right text-gray-500 overflow-x-scroll">
            <thead>
            <tr>
              <th scope="col" className="px-6 py-3 text-[#333] text-[12px] font-medium">
                Employee Name
              </th>
              <th scope="col" className="px-6 py-3 text-[#333] text-[12px] font-medium">
                Start Date
              </th>
              <th scope="col" className="px-6 py-3 text-[#333] text-[12px] font-medium">
                End Date
              </th>
              <th scope="col" className="px-6 py-3 text-[#333] text-[12px] font-medium">
                Total Days
              </th>
              <th scope="col" className="px-6 py-3 text-[#333] text-[12px] font-medium">
                Vacation Type
              </th>
              <th scope="col" className="px-6 py-3 text-[#333] text-[12px] font-medium">
                Comment
              </th>
              <th scope="col" className="px-6 py-3 text-[#333] text-[12px] font-medium">
                Employee Details
              </th>
            </tr>
            </thead>
            <tbody>
            {globalVacationHistory.map((record, index) => (
              <tr key={index} className="bg-white">
                <th scope="row" className="px-6 py-4 font-normal text-[12px] text-gray-900 whitespace-nowrap">
                  {record.talent.fullName}
                </th>
                <td className="px-6 py-4 text-[12px]">
                  {moment(record.startDate).format('DD/MM/YYYY')}
                </td>
                <td className="px-6 py-4 text-[12px]">
                  {moment(record.endDate).format('DD/MM/YYYY')}
                </td>
                <td className="px-6 py-4 text-[12px]">
                  {record.isHalfDay ? "Half Day" : moment(record.endDate).diff(moment(record.startDate), 'days') + 1}
                </td>
                <td className="px-6 py-4 text-[12px] capitalize">
                  {record.type ? record.type + ' Leave' : '-'}
                </td>
                <td className="px-6 py-4 text-[12px]">
                  {record.comment ? record.comment : "No comment is provided"}
                </td>
                <td
                  onClick={() => toggleDetails(record.talentId)}
                  className="px-6 py-4 text-[12px] text-[#4D4AEA] hover:underline cursor-pointer">
                  Show Details
                </td>
                <td className="px-6 py-4 text-[12px]">
                  <button className="font-medium text-purple-500 hover:underline" onClick={() => toggleEditRequest(record, record.talent.fullName, record.talent.id)}>Edit</button>
                </td>
                <td className="px-6 py-4 text-[12px]">
                  <button className="font-medium text-red-500 hover:underline" onClick={() => handleDeleteRequest(record)}>Reject</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </GenericModal>
    </>
  )
}

export default VacationHistory