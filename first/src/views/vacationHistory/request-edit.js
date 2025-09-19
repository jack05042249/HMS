import icons from '../../icons';
import { useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from 'react-datepicker';
import GenericModal from '../components/modal/GenericModal';
import { updateGlobalVacationHistoryData } from '../../store/actionCreator';
import { showNotificationSuccess } from '../../utils/notifications';
import moment from 'moment';
import { useDispatch } from 'react-redux'
import axios from 'axios';
import { set } from 'lodash';

const RequestEdit = ({ requestData, displayModal, closeModal, API_URL, fullName, talentId, edited, setEdited }) => {
  const { startDate, endDate, comment, type, id, isHalfDay } = requestData;
  const formattedStartDate = startDate ? new Date(startDate) : new Date();
  const formattedEndDate = endDate ? new Date(endDate) : new Date();
  const initValues = {
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    type: type,
    comment: comment,
    isHalfDay: isHalfDay,
    talentId: talentId,
  };
  const initState = { values: initValues };
  const [formState, setFormState] = useState(initState);
  const [error, setError] = useState('');
  const { values } = formState;
  const dispatch = useDispatch()

  const handleChangeForm = ({ target }) =>
    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [target.name]: target.value
      }
    }));

  const handleSendRequest = async () => {
    try {
      let requestData = {
        id: id,
        startDate: moment(values.startDate).format('YYYY-MM-DD'),
        endDate: moment(values.endDate).format('YYYY-MM-DD'),
        type: values.type,
        comment: values.comment,
        isHalfDay: values.isHalfDay,
        talentId: talentId,
      };

      let hasError = false;

      if (!requestData.startDate || !requestData.endDate) {
        setError('Start Date and End Date are required');
        hasError = true;
      } else if (moment(requestData.startDate).isAfter(requestData.endDate)) {
        setError('Start Date cannot be after End Date');
        hasError = true;
      } else {
        setError('')
      }

      if (!requestData.startDate || !requestData.endDate || requestData.startDate === 'Invalid date' || requestData.endDate === 'Invalid date') {
        setError('Start Date and End Date are required');
        hasError = true;
      }

      if (!hasError) {
        const response = await axios.put(`${API_URL}/vacation/updateRequest/${id}`, requestData);
        if (response.status === 200) {
          requestData = {
            id: id,
            startDate: moment(values.startDate).format('YYYY-MM-DD'),
            endDate: moment(values.endDate).format('YYYY-MM-DD'),
            type: values.type,
            talentId: talentId,
            isHalfDay: values.isHalfDay,
            comment: values.comment,
            talent: {
              fullName: fullName,
              id: talentId
            }
          }
          dispatch(updateGlobalVacationHistoryData(requestData));
          setEdited(!edited)

          showNotificationSuccess('Vacation request was updated');
          closeModal();
          setFormState({
            values: {
              startDate: '',
              endDate: '',
              type: '',
              comment: '',
              isHalfDay: false,
            },
          });
        }
      }
    } catch (error) {
      setError(error.response.data?.error)
      console.error('Error sending form:', error);
    }
  };

  return (
    <GenericModal closeModal={closeModal} displayModal={displayModal}>
      <div className="flex items-center mb-[15px]">
        <icons.vacationModal/>
        <h1 className='text-left text-[#333] text-[20px] font-medium ml-[15px]'>Edit vacation</h1>
      </div>
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="flex">
          <div className='flex flex-col justify-start p-5 text-[14px]'>
            <label htmlFor='type' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>Leave Type</label>
            <span className='relative left-[280px] top-[24px] pointer-events-none'> <icons.selectIcon /> </span>
            <select
              className='border border-[#F5F0F0] w-[313px] disabled:bg-slate-100 cursor-not-allowed rounded-lg h-[40px] px-[15px] appearance-none outline-none'
              id='type'
              name='type'
              disabled={true}
              value={values.type}
            >
              <option>Select type</option>
              <option value='vacation'>Vacation</option>
              <option value='sick'>Sick</option>
              <option value='unpaid'>Unpaid</option>
            </select>
            <label htmlFor='startDate' className='text-[#000] text-[14px] font-medium text-left my-[12px]'>Start
              Date</label>
            <DatePicker
              name="startDate"
              id="startDate"
              selected={values.startDate}
              onChange={(date) => handleChangeForm({ target: { name: 'startDate', value: date } })}
              selectsStart
              placeholderText={"DD/MM/YYYY"}
              startDate={values.startDate}
              endDate={values.endDate}
              dateFormat="dd/MM/yyyy"
              className={!error ? `border border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] outline-none` : `border border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] outline-none text-[#D0004B]`}
            />
            <label htmlFor='endDate' className='text-[#000] text-[14px] font-medium text-left my-[12px]'>End Date</label>
            <DatePicker
              name="endDate"
              id="endDate"
              selected={values.endDate}
              onChange={(date) => handleChangeForm({ target: { name: 'endDate', value: date } })}
              selectsEnd
              placeholderText={"DD/MM/YYYY"}
              startDate={values.startDate}
              endDate={values.endDate}
              dateFormat="dd/MM/yyyy"
              className={!error ? `border border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] outline-none` : `border border-[#F5F0F0] w-[313px] rounded-lg h-[40px] px-[15px] outline-none text-[#D0004B]`}
            />
          </div>
          <div className='flex flex-col justify-start h-[300px]'>
            <label htmlFor='comment' className='text-[#000] text-[14px] font-medium text-left my-[17px]'>Comment</label>
            <textarea
              className='w-[310px] h-[215px] rounded-xl disabled:bg-slate-100 cursor-not-allowed border border-[#F5F0F0] p-4 resize-none outline-none text-[12px]'
              id='comment'
              name='comment'
              disabled={true}
              value={values.comment}
              onChange={handleChangeForm}
            />
            {isHalfDay && (
              <div className="flex justify-start">
                <input
                  type="checkbox"
                  id="halfDay"
                  name="isHalfDay"
                  checked={values.isHalfDay}
                  onChange={(event) =>
                    handleChangeForm({
                      target: { name: "isHalfDay", value: event.target.checked },
                    })
                  }
                />
                <label htmlFor="halfDay" className="text-[#000] text-[14px] font-medium text-left ml-[5px]">
                  Half Day
                </label>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          {error && <span className='text-[#D0004B] max-w-[260px] text-[12px] flex text-left items-center'><span className="mr-[5px]"> <icons.alert/> </span> {error}</span>}
          <div className="flex justify-end text-[14px] font-medium ml-[65px]">
            <button onClick={() => closeModal()} className="px-[16px] py-[8px] border border-[#E0E0E0] rounded-md w-[141px] mr-[15px]">
              <span>Cancel</span>
            </button>
            <button  className="px-[16px] py-[8px] bg-[#4D4AEA] rounded-md w-[150px]" onClick={() => handleSendRequest()}>
              <span className="text-[#FFF]">Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </GenericModal>
  )
}

export default RequestEdit