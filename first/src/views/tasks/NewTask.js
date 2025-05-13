import axios from 'axios';
import { PrimaryButton, SecondaryButton } from '../components/buttons';
import GenericModal from '../components/modal/GenericModal';
import icons from '../../icons';
import { DateField, SelectField, TextAreaField } from '../components/fields';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { DateHelper, RISK, RISKS, STATUS, STATUSES, TYPE, TYPES } from '../../utils';
import { showNotificationSuccess } from '../../utils/notifications';
import config from '../../config';
import { SearchableField } from '../components/fields/SearchableField';

const NewTask = ({ isOpen, defaultType, defaultObjectId, onCreated, onClose }) => {
  const [type, setType] = useState(TYPE.TALENT.value);
  const [talent, setTalent] = useState();
  const [stakeholder, setStakeholder] = useState();
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState(STATUS.OPEN.value);
  const [risk, setRisk] = useState(RISK.LOW.value);
  const [dueDate, setDueDate] = useState(DateHelper.getTomorrow());

  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const isTalent = type === TYPE.TALENT.value;
  const isStakeholder = type === TYPE.STAKEHOLDER.value;

  const defaultTalent = defaultType === TYPE.TALENT.value ? defaultObjectId : undefined;
  const defaultStakeHolder = defaultType === TYPE.STAKEHOLDER.value ? defaultObjectId : undefined;

  useEffect(() => {
    if (isOpen) {
      setType(defaultType || TYPE.TALENT.value);
      setTalent(defaultTalent);
      setStakeholder(defaultStakeHolder);
      setNotes('');
      setStatus(STATUS.OPEN.value);
      setRisk(RISK.LOW.value);
      setDueDate(DateHelper.getTomorrow());
      setError();
      setIsLoading(false);
    }
  }, [defaultStakeHolder, defaultTalent, defaultType, isOpen]);

  const aggregatedTalents = useSelector(state => state.aggregatedTalents);
  const customers = useSelector(state => state.customers);

  const handleChangeType = useCallback(e => {
    setType(e.target.value);
    setTalent();
    setStakeholder();
  }, []);

  const handleChangeTalent = useCallback(e => setTalent(e.target.value), []);

  const handleChangeStakeholder = useCallback(e => setStakeholder(e.target.value), []);

  const handleChangeNotes = useCallback(e => setNotes(e.target.value), []);

  const handleStatusChange = useCallback(e => setStatus(e.target.value), []);

  const handleChangeRisk = useCallback(e => setRisk(e.target.value), []);

  const handleCreate = useCallback(() => {
    if (isTalent && !talent) {
      setError('Please select a talent');
      return;
    }

    if (isStakeholder && !stakeholder) {
      setError('Please select a stakeholder');
      return;
    }

    if (!notes) {
      setError('Please add notes');
      return;
    }

    setError();
    setIsLoading(true);

    const url = isTalent ? `${config.API_URL}/tasks-employee` : `${config.API_URL}/tasks-customer`;
    const requestData = {
      ...(isTalent ? { talentId: talent } : { customerId: stakeholder }),
      talentId: isTalent ? talent : stakeholder,
      comment: notes,
      risk,
      dueDate,
      status
    };

    axios
      .post(url, requestData)
      .then(() => {
        showNotificationSuccess('Task created successfully');
        onClose();
        onCreated(type);
      })
      .catch(() => {
        setError('An error occurred while creating the task');
      })
      .finally(() => setIsLoading(false));
  }, [onClose, isStakeholder, isTalent, notes, onCreated, risk, dueDate, stakeholder, status, talent, type]);

  const talentsOptions = useMemo(() => {
    return aggregatedTalents.map(talent => ({
      value: talent.id,
      label: talent.fullName
    }));
  }, [aggregatedTalents]);

  const stakeholdersOptions = useMemo(() => {
    return customers.map(customer => ({
      value: customer.id,
      label: customer.fullName
    }));
  }, [customers]);

  return (
    <>
      <GenericModal displayModal={isOpen} closeModal={onClose}>
        <div className='pl-5 relative'>
          <div className='flex text-[#333] text-[20px] font-medium mt-2 items-center gap-3'>
            <icons.tasks />
            <span>New Task</span>
          </div>
          <div className='flex mt-8 mb-6 gap-4 flex-col'>
            <SelectField name='Type' id='type' value={type} options={TYPES} onChange={handleChangeType} />
            {isTalent ? (
              <SearchableField
                name='Talent'
                data={talentsOptions.map(t => ({ key: `${t.value}`, value: t.label }))}
                selectedKeys={talent ? [`${talent}`] : []}
                emptyText='Select Talent'
                onChangeSelectedKeys={selectedKeys => {
                  handleChangeTalent({
                    target: {
                      value: selectedKeys.length ? selectedKeys[selectedKeys.length - 1] : null
                    }
                  });
                }}
              />
            ) : (
              <SearchableField
                name='Stakeholder'
                data={stakeholdersOptions.map(t => ({ key: `${t.value}`, value: t.label }))}
                selectedKeys={stakeholder ? [`${stakeholder}`] : []}
                emptyText='Select Stakeholder'
                onChangeSelectedKeys={selectedKeys => {
                  handleChangeStakeholder({
                    target: {
                      value: selectedKeys.length ? selectedKeys[selectedKeys.length - 1] : null
                    }
                  });
                }}
              />
            )}
            <TextAreaField name='Notes' id='notes' value={notes} onChange={handleChangeNotes} />
            <SelectField name='Status' id='status' value={status} options={STATUSES} onChange={handleStatusChange} />
            <SelectField name='Risk' id='risk' value={risk} options={RISKS} onChange={handleChangeRisk} />
            <DateField
              name='Due Date'
              id='dueDate'
              minDate={DateHelper.getToday()}
              value={dueDate}
              onChange={setDueDate}
            />
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
            <SecondaryButton onClick={onClose} isDisabled={isLoading}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleCreate} isDisabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </PrimaryButton>
          </div>
        </div>
      </GenericModal>
    </>
  );
};

export { NewTask };
