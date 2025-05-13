import React, { useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GenericModal from '../components/modal/GenericModal';
import { getValuesFromElement } from '../../utils/getValuesFromElement';
import { handleError } from '../../utils/handleError';
import axios from 'axios';
import { showNotificationSuccess } from '../../utils/notifications';
import history from '../../utils/browserHistory';
import { updateSingleOrganization } from '../../store/actionCreator';
import { get } from 'lodash';
import sortArr from '../../utils/sortArr';
import SortButton from '../components/sortButton/SortButton';
import icons from '../../icons';
import ConfirmModal from './confirm-modal';

const Organizations = ({ API_URL }) => {
    const { organizations } = useSelector(state => state)
    const [editOrganizationId, setEditOrganizationId] = useState()
    const [error, setError] = useState('')
    const [filter, setFilter] = useState('')
    const [sortBy, setSortBy] = useState('created ASC')
    const [page, setPage] = useState(1)
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)
    const [orgData, setOrgdata] = useState()

    const dispatch = useDispatch()

    useLayoutEffect(() => {
        const { id } = get(history, 'location.state') || {}
        if (id) setEditOrganizationId(id)
        history.replace()
    }, [])

    const getRelevantOrganization = (id) => {
        return organizations.find(cus => cus.id === id)
    }

    const filteredOrg = filter ? organizations.filter(org => {
        const { name } = org
        if (
            name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
        ) {
            return true
        }
        return false
    }) : organizations

    const sortedOrg = sortArr(filteredOrg, sortBy)

    const removeError = () => {
        if (error) setError('')
    }

    const closeModal = () => {
        removeError()
        setEditOrganizationId()
    }

    const handleOrganization = async () => {
        try {
            removeError()
            const { data, missed } = getValuesFromElement('single_organization')
            if (missed) {
                setError(`${missed} is required`)
                return
            }
            if (!data.name.trim()) {
                setError('Customer cannot be empty');
                return;
            }
            const isNew = editOrganizationId < 0
            if (isNew) {
                const { data: { savedOrganization } } = await axios.post(`${API_URL}/organizations`, data)
                dispatch(updateSingleOrganization(savedOrganization))
                showNotificationSuccess('Customer added successfully')
                closeModal()
                return
            }
            data.id = editOrganizationId
            const { status } = await axios.put(`${API_URL}/organizations`, data)
            if (status === 204) {
                dispatch(updateSingleOrganization(data))
                showNotificationSuccess('Customer updated successfully')
                closeModal()
            }
        } catch (error) {
            setError(error?.response?.data || 'Something went wrong')
            handleError(error, dispatch, history)
        }
    }
    const handleDeleteOrganization = (organizationData) => {
        setIsConfirmModalVisible(true)
        setOrgdata(organizationData)
    }

    const renderSingleOrg = () => {
        const relevantCustomer = getRelevantOrganization(editOrganizationId) || {}
        const { id, name } = relevantCustomer
        return (
            <div id="single_organization" className="px-5 relative">
                <div className='flex text-[#333] text-[20px] font-medium my-2'>
                    <span className="mr-3 text-[#333] text-[20px] font-medium"> { name ? <icons.userEditIcon/> : <icons.addUserGray/>} </span>  <span className="text-[#333] text-[20px] font-medium">{name ? `Edit ${name}` : 'Add Customer'}</span>
                </div>
                <form className="flex flex-col mt-6" onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor='name' className='text-[#000] mb-3 text-[14px] font-medium text-left'>Customer Name</label>
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
                        <button
                          onClick={() => handleOrganization()}
                          className="px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[160px] text-[14px] text-[#fff]">
                            Save and Add
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div id="organizations" className='flex column'>
            {!!editOrganizationId && <GenericModal displayModal={!!editOrganizationId} closeModal={closeModal}>
                {renderSingleOrg()}
            </GenericModal>}
            <div>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center">
                        <span className="w-[24px] h-[24px]"><icons.orgz/></span>
                        <p className="text-[#333] text-[24px]  font-semibold leading-9 ml-3">Partner Customers</p>
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
                              onClick={() => setEditOrganizationId(-1)}
                              className="bg-[#4D4AEA] w-[180px] rounded-md flex text-[14px] text-[#FFF] items-center justify-between font-medium py-[8px] px-[16px]">
                                Add Customer <span> <icons.addUser/> </span> </button>
                        </div>
                    </div>
                    <table className=" w-full  text-sm text-left rtl:text-right text-gray-500 overflow-x-scroll">
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
                        {sortedOrg.map((org,idx) => (
                          <tr key={org.id} className="bg-white border-b   border-gray-100 text-[#9197B3]">
                              <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                                  {idx + 1}
                              </th>
                              <th scope="row"
                                  className="px-6 py-4 font-medium whitespace-nowrap text-[#333] hover:text-[#4D4AEA]">
                                  {org.name}
                              </th>
                              <th scope="row"
                                  className="py-4 px-6 flex justify-end font-medium whitespace-nowrap">
                                  <button
                                    onClick={() => setEditOrganizationId(org.id)}
                                    className="mr-3"
                                  >
                                      <icons.editIcon/>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOrganization(org)}
                                  >
                                      <icons.deleteIcon />
                                  </button>
                              </th>
                          </tr>
                        ))}
                        </tbody>
                    </table>
                    {/*<div className="flex justify-between items-center pt-10 px-10">*/}
                    {/*    <button*/}
                    {/*      className="px-[16px] py-[8px] border-[#E0E0E0] border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"*/}
                    {/*      onClick={() => setPage(page - 1)}*/}
                    {/*      // disabled={vacationHistory.currentPage === 1}*/}
                    {/*    >*/}
                    {/*        <span className="text-[14px] text-[#2A2A2A] text-center font-medium">Previous</span>*/}
                    {/*    </button>*/}
                    {/*    <p className="text-[14px] font-medium text-[#2A2A2A]">Page 1 of 1</p>*/}
                    {/*    <button*/}
                    {/*      className="px-[16px] py-[8px] border-[#E0E0E0] border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"*/}
                    {/*      onClick={() => setPage(page + 1)}*/}
                    {/*      // disabled={vacationHistory.currentPage === vacationHistory.totalPages}*/}
                    {/*    >*/}
                    {/*        <span className="text-[14px] text-[#2A2A2A] text-center font-medium">Next</span>*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>
            </div>
            {!!isConfirmModalVisible &&
              <ConfirmModal
                API_URL={API_URL}
                orgData={orgData}
                onClose={() => setIsConfirmModalVisible(false)}
                displayModal={isConfirmModalVisible}
              />
            }
        </div>
    )
}

export default Organizations
