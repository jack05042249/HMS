import { useCallback, useState } from 'react';
import moment from 'moment';
import axios from 'axios';

import icons from '../../icons';
import { DateField, SelectField, TextAreaField } from '../components/fields';
import { PrimaryButton, SecondaryButton } from '../components/buttons';
import { DateHelper, RISK, RISKS, STATUS, STATUSES, useGetCustomer, useGetTalent } from '../../utils';
import config from '../../config';

const UpdateTaskModalContent = ({ taskToEdit, onCancel, onSaved, onFailedSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRelevantTalent = useGetTalent();
  const getRelevantCustomer = useGetCustomer();

  const isCustomer = taskToEdit.type === 'customer';

  const relevantObject =
    taskToEdit.type === 'customer'
      ? getRelevantCustomer(taskToEdit.customerId)
      : getRelevantTalent(taskToEdit.talentId);

  const [notes, setNotes] = useState(taskToEdit.comment || '');
  const [status, setStatus] = useState(taskToEdit.status || STATUS.OPEN.value);
  const [risk, setRisk] = useState(taskToEdit.risk || RISK.LOW.value);
  const [dueDate, setDueDate] = useState(moment(taskToEdit.dueDate).toDate() || DateHelper.getTomorrow());

  const handleChangeNotes = useCallback(e => setNotes(e.target.value), []);
  const handleStatusChange = useCallback(e => setStatus(e.target.value), []);
  const handleChangeRisk = useCallback(e => setRisk(e.target.value), []);

  const onSaveHandler = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const { id } = taskToEdit;
    const url = isCustomer ? `${config.API_URL}/tasks-customer/${id}` : `${config.API_URL}/tasks-employee/${id}`;
    const data = {
      comment: notes,
      status,
      risk,
      dueDate
    };
    axios
      .put(url, data)
      .then(({ data }) => onSaved(taskToEdit, data.task))
      .catch(() => {
        onFailedSave(taskToEdit);
        setError('Failed to update task');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dueDate, isCustomer, notes, onFailedSave, onSaved, risk, status, taskToEdit]);

  if (!taskToEdit) {
    return null;
  }

  return (
    <div className='pl-5 relative'>
      <div className='flex text-[#333] text-[20px] font-medium mt-2 items-center gap-3'>
        <icons.tasks />
        <span>Update {relevantObject.fullName}'s Task</span>
      </div>
      <div className='flex mt-8 mb-6 gap-4 flex-col'>
        <TextAreaField name='Notes' id='notes' value={notes} onChange={handleChangeNotes} />
        <SelectField name='Status' id='status' value={status} options={STATUSES} onChange={handleStatusChange} />
        <SelectField name='Risk' id='risk' value={risk} options={RISKS} onChange={handleChangeRisk} />
        <DateField name='Due Date' id='dueDate' minDate={DateHelper.getToday()} value={dueDate} onChange={setDueDate} />
      </div>
      {error && (
        <span className='text-red-600 text-sm flex items-center gap-2 my-1'>
          <span>
            <icons.alert />
          </span>
          {error}
        </span>
      )}
      <div className='flex items-center justify-end'>
        <SecondaryButton onClick={onCancel} isDisabled={isLoading}>
          Cancel
        </SecondaryButton>
        <PrimaryButton onClick={onSaveHandler} isDisabled={isLoading} isLoading={isLoading}>
          Save
        </PrimaryButton>
      </div>
    </div>
  );
};

export default UpdateTaskModalContent;
