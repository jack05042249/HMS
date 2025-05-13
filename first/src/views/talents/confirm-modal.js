import icons from '../../icons';
import '../talentProfile/success-modal.scss';
import axios from 'axios';
import {
  deleteCustomer as deleteCustomerFromRedux,
  deleteTalent as deleteReduxTalent
} from '../../store/actionCreator';
import { showNotificationSuccess } from '../../utils/notifications';
import { useDispatch, useSelector } from 'react-redux';

const ConfirmModal = ({ talentData, isVisible, onClose, API_URL, isTalent, customerData }) => {
  const { codeToCountry } = useSelector(state => state.countries);
  const { fullName, location, id } = isTalent ? talentData : customerData;

  const dispatch = useDispatch();

  if (!isVisible) {
    return null;
  }

  const deleteCustomer = async () => {
    const { status } = await axios.delete(`${API_URL}/customer/${id}`);
    if (status === 204) {
      dispatch(deleteCustomerFromRedux(id));
      showNotificationSuccess('Stakeholder deleted successfully');
      onClose();
    }
  };

  const deleteTalent = async () => {
    const { status } = await axios.delete(`${API_URL}/talent/${id}`);
    if (status === 204) {
      dispatch(deleteReduxTalent(id));
      showNotificationSuccess('The talent deleted successfully.');
      onClose();
    }
  };
  const handleCloseButtonClick = () => {
    onClose();
  };

  if (!isVisible) {
    return null;
  }
  return (
    <div className='success-modal'>
      <div className='success-modal-content'>
        <div className='flex'>
          <div className='relative top-0.5 mr-1'>
            {' '}
            <icons.deleteIcon style={{ width: '22px', height: '22px' }} />{' '}
          </div>
          <div className='flex justify-start flex-col'>
            <div className='flex justify-start items-center relative'>
              <h1 className='text-[#333] text-[20px] font-medium'>
                {isTalent ? 'Delete Employee' : 'Delete Stakeholder'}
              </h1>
            </div>
            <h2 className='text-[14px] text-left font-medium font-[#000]'>
              Are you sure you want to delete this {isTalent ? 'employee' : 'stakeholder'}?
            </h2>
            <p className='text-[#9197B3] text-[16px] text-left my-5'>
              {fullName}, {codeToCountry[location]}
            </p>
          </div>
        </div>
        <div className='flex items-center justify-center'>
          <button
            className='w-[120px] px-[16px] mr-2.5 py-[8px] border-[#E0E0E0] border rounded-lg font-medium text-[#020202] text-[14px]'
            onClick={handleCloseButtonClick}
          >
            No, Cancel
          </button>
          {isTalent ? (
            <button
              onClick={() => deleteTalent()}
              className='px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[120px] text-[14px] text-[#fff]'
            >
              Yes, Delete
            </button>
          ) : (
            <button
              onClick={() => deleteCustomer()}
              className='px-[16px] py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[120px] text-[14px] text-[#fff]'
            >
              Yes, Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
