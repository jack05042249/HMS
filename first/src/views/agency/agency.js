import React, { useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GenericModal from '../components/modal/GenericModal';
import { getValuesFromElement } from '../../utils/getValuesFromElement';
import { handleError } from '../../utils/handleError';
import axios from 'axios';
import { showNotificationSuccess } from '../../utils/notifications';
import history from '../../utils/browserHistory';
import { updateAgencyData } from '../../store/actionCreator';
import { get } from 'lodash';
import sortArr from '../../utils/sortArr';
import SortButton from '../components/sortButton/SortButton';
import icons from '../../icons';
import ConfirmModal from '../organizations/confirm-modal';

const Agency = ({ API_URL }) => {
  const { agencies } = useSelector(state => state)
  const [editAgencyId, setEditAgencyId] = useState()
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState('created ASC')
  const [page, setPage] = useState(1)
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)
  const [agencyData, setAgencyData] = useState()
  const dispatch = useDispatch()

  useLayoutEffect(() => {
    const { id } = get(history, 'location.state') || {}
    if (id) setEditAgencyId(id)
    history.replace()
  }, [])

  const filteredAgencies = filter ? agencies.filter(org => {
    const { name } = org
    if (
      name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
    ) {
      return true
    }
    return false
  }) : agencies

  const sortedAgencies = sortArr(filteredAgencies, sortBy)

  const removeError = () => {
    if (error) setError('')
  }

  const closeModal = () => {
    removeError()
    setEditAgencyId()
  }
  const getRelevantAgency = (id) => {
    return agencies.find(agency => agency.id === id)
  }

  const handleUpdateAgency = async (id) => {
    try {
      removeError()
      const { data, missed } = getValuesFromElement('agency')
      if (missed) {
        setError(`${missed} is required`)
        return
      }
      const agencyData = {
        id: id,
        name: data.name
      }
      const responseUpdate = await axios.put(`${API_URL}/agency/${id}`, agencyData)
      if (responseUpdate) {
        dispatch(updateAgencyData(agencyData))
        showNotificationSuccess('Agency updated successfully')
        closeModal()
      }

    } catch (error) {
      setError(error?.response?.data)
      handleError(error, dispatch, history)
    }
  }

  const handleAgencies = async () => {
    try {
      removeError();
      const { data, missed } = getValuesFromElement('agency');
      if (missed) {
        setError(`${missed} is required`);
        return;
      }
      if (!data.name.trim()) {
        setError('Agency cannot be empty');
        return;
      }
      const createResponse = await axios.post(`${API_URL}/agency`, data);
      if (createResponse) {
        dispatch(updateAgencyData(createResponse.data));
        showNotificationSuccess('Agency added successfully');
        closeModal();
      }
    } catch (error) {
      setError(error?.response?.data);
      handleError(error, dispatch, history);
    }
  };

  const handleDeleteAgency = (organizationData) => {
    setIsConfirmModalVisible(true)
    setAgencyData(organizationData)
  }

  const renderSingleOrg = () => {
    const { id, name } = getRelevantAgency(editAgencyId) || {}
    return (
      <div id="agency" className="px-5 relative">
        <div className='flex text-[#333] text-[20px] font-medium my-2'>
          <span className="mr-3 text-[#333] text-[20px] font-medium"> { name ? <icons.userEditIcon/> : <icons.addUserGray/>} </span>  <span className="text-[#333] text-[20px] font-medium">{name ? `Edit ${name}` : 'Add Agency'}</span>
        </div>
        <form className="flex flex-col mt-6" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor='name' className='text-[#000] mb-3 text-[14px] font-medium text-left'>Agency Name</label>
          <span className='relative left-[280px] top-[25px] pointer-events-none'> <span> { name ? <icons.editIcon /> : null } </span> </span>
          <input
            id="name"
            type="text"
            name="name"
            defaultValue={name}
            placeholder="Google"
            className='border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-[40px] px-[15px] appearance-none outline-none'
          />
          {error && <p className='text-[#D0004B] max-w-[250px] absolute top-[9rem] capitalize text-[14px] flex items-center'><span className="mr-[5px]"> <icons.alert/> </span> {error}</p>}
          <div className="flex items-center mr-9 justify-end">
            <button
              onClick={() => closeModal()}
              className="w-[145px] px-[16px] mr-2.5 py-[8px] border-[#E0E0E0] border rounded-md font-medium text-[#020202] text-[14px]" >
              Cancel
            </button>
            {
              editAgencyId < 0 ?
                <button
                  onClick={() => handleAgencies()}
                  className="px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[160px] text-[14px] text-[#fff]">
                  Save and Add
                </button>
                :
                <button
                  onClick={() => handleUpdateAgency(id)}
                  className="px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[160px] text-[14px] text-[#fff]">
                  Update Agency
                </button>
            }
          </div>
        </form>
      </div>
    )
  }

  return (
    <div id="organizations" className='flex column'>
      {!!editAgencyId && <GenericModal displayModal={!!editAgencyId} closeModal={closeModal}>
        {renderSingleOrg()}
      </GenericModal>}
      <div>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center">
            <span className="w-[24px] h-[24px]"><icons.orgz/></span>
            <p className="text-[#333] text-[24px]  font-semibold leading-9 ml-3">Agency Page</p>
          </div>
        </div>
        <div className="bg-[#FFF] w-full mt-5 h-fit shadow-md rounded-lg py-[35px]">
          <div className="flex items-center mb-5 justify-between px-[20px]">
            <div className="border b-[#E7E7E7] py-[8px] px-[16px] rounded-md w-[300px] flex items-center">
              <span> <icons.search/> </span>
              <input
                value={filter} onChange={e => setFilter(e.target.value)}
                placeholder="Search"
                className="outline-none ml-2.5 text-[12px] w-[200px]"
                type='text'
              />
            </div>
            <div>
              <button
                onClick={() => setEditAgencyId(-1)}
                className="bg-[#4D4AEA] w-[140px] rounded-md flex text-[14px] text-[#FFF] items-center justify-between font-medium py-[8px] px-[16px]">
                Add Agency <span> <icons.addUser/> </span> </button>
            </div>
          </div>
          <table className=" w-full  text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-[12px] text-gray-700 border-b border-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">
                №
              </th>
              <th scope="col" className="px-6 py-3 font-medium flex px-7">
                Name
                <SortButton
                  sortBy={sortBy} setSortBy={setSortBy} />
              </th>
            </tr>
            </thead>
            <tbody className="text-[12px]">
            {sortedAgencies.map((agency,idx) => (
              <tr key={agency.id} className="bg-white border-b   border-gray-100 text-[#9197B3]">
                <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                  {idx + 1}
                </th>
                <th scope="row"
                    className="px-6 py-4 font-medium whitespace-nowrap text-[#333] hover:text-[#4D4AEA]">
                  {agency.name}
                </th>
                {agency.name.toLowerCase() === "itsoft" || parseInt(agency.id) === 1 ? null
                : (
                    <th scope="row"
                        className="py-4 px-6 flex justify-end font-medium whitespace-nowrap">
                      <button
                        onClick={() => setEditAgencyId(agency.id)}
                        className="mr-3"
                      >
                        <icons.editIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteAgency(agency)}
                      >
                        <icons.deleteIcon />
                      </button>
                    </th>
                  )}
              </tr>
            ))}
            </tbody>
          </table>
          {/*<div className="flex justify-between items-center pt-10 px-10">*/}
          {/*  <button*/}
          {/*    className="px-[16px] py-[8px] border-[#E0E0E0] border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"*/}
          {/*    onClick={() => setPage(page - 1)}*/}
          {/*    // disabled={vacationHistory.currentPage === 1}*/}
          {/*  >*/}
          {/*    <span className="text-[14px] text-[#2A2A2A] text-center font-medium">Previous</span>*/}
          {/*  </button>*/}
          {/*  <p className="text-[14px] font-medium text-[#2A2A2A]">Page 1 of 1</p>*/}
          {/*  <button*/}
          {/*    className="px-[16px] py-[8px] border-[#E0E0E0] border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"*/}
          {/*    onClick={() => setPage(page + 1)}*/}
          {/*    // disabled={vacationHistory.currentPage === vacationHistory.totalPages}*/}
          {/*  >*/}
          {/*    <span className="text-[14px] text-[#2A2A2A] text-center font-medium">Next</span>*/}
          {/*  </button>*/}
          {/*</div>*/}
        </div>
      </div>
      {!!isConfirmModalVisible &&
        <ConfirmModal
          agencyData={agencyData}
          API_URL={API_URL}
          isAgency={true}
          onClose={() => setIsConfirmModalVisible(false)}
          displayModal={isConfirmModalVisible}
        />
      }
    </div>
  )
}

export default Agency
