import GenericModal from '../components/modal/GenericModal';
import '../talentProfile/success-modal.scss'
import icons from '../../icons';
import axios from 'axios';
import { deleteOrganization as deleteReduxOrganization, deleteAgency } from '../../store/actionCreator';
import { showNotificationError, showNotificationSuccess } from '../../utils/notifications';
import { useDispatch } from 'react-redux';


const ConfirmModal = ({ displayModal, onClose, orgData, API_URL, isAgency, agencyData }) => {
  const { id, name } = isAgency ? agencyData : orgData
  const dispatch = useDispatch()

  const deleteOrganization = async () => {
        const { status } = await axios.delete(`${API_URL}/organizations/${id}`)
        if (status === 204) {
          dispatch(deleteReduxOrganization(id))
          showNotificationSuccess('Customer deleted successfully')
          onClose()
    }
  }
  const delAgency = async () => {
    try {
      const { status } = await axios.delete(`${API_URL}/agency/${id}`)
      if (status === 204) {
        dispatch(deleteAgency(id))
        showNotificationSuccess('Agency deleted successfully')
        onClose()
      }
    } catch (e) {
      showNotificationError('There are still talents attached to this agency', 'Deleting error')
    }
  }


  return (
    <GenericModal displayModal={displayModal} closeModal={onClose}>
      <div className="flex">
        <div className="relative top-0.5 mr-1">  <icons.deleteIcon style={{ width: '22px', height: '22px' }}/> </div>
        <div className="flex justify-start flex-col">
          <div className="flex justify-start items-center relative mb-4">
            <h1 className="text-[#333] text-[20px] font-medium">Delete { isAgency ? 'Agency' : 'Customer'} </h1>
          </div>
          <h2 className="text-[14px] text-left font-medium font-[#000]">Are you sure you want to delete this { isAgency ? 'agency' : 'customer' } ?</h2>
          <p className="text-[#9197B3] text-[16px] text-left my-5"> { name }</p>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <button className="w-[120px] px-[16px] mr-2.5 py-[8px] border-[#E0E0E0] border rounded-lg font-medium text-[#020202] text-[14px]" onClick={() => onClose()}>
          No, Cancel
        </button>
        {
          isAgency ?
            <button
              onClick={() => delAgency()}
              className="px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[120px] text-[14px] text-[#fff]">
              Yes, Delete
            </button>
            :
            <button
              onClick={() => deleteOrganization()}
              className="px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[120px] text-[14px] text-[#fff]">
              Yes, Delete
            </button>
        }
      </div>
    </GenericModal>
  )
}

export default ConfirmModal
