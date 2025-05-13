import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { usePrevious } from '../../../utils';

const FilterItem = ({
  isSelected,
  icon,
  label,
  options,
  selectedOptions,
  mustHaveSelection = true,
  singleSelect = false,
  onApplyFilter
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const [selectedOptionsInner, setSelectedOptionsInner] = useState(selectedOptions);
  const prevSelectedOptionsInner = usePrevious(selectedOptionsInner);

  useEffect(() => {
    setSelectedOptionsInner(selectedOptions);
  }, [selectedOptions]);

  useEffect(() => {
    if (isOpenModal) {
      setSelectedOptionsInner(selectedOptions);
    }
  }, [isOpenModal, selectedOptions]);

  useLayoutEffect(() => {
    if (
      mustHaveSelection &&
      selectedOptionsInner.length === 0 &&
      prevSelectedOptionsInner &&
      prevSelectedOptionsInner.length > 0
    ) {
      setSelectedOptionsInner(prevSelectedOptionsInner);
    }
  }, [mustHaveSelection, options, prevSelectedOptionsInner, selectedOptionsInner]);

  const openModal = useCallback(() => setIsOpenModal(true), []);

  const closeModal = useCallback(() => setIsOpenModal(false), []);

  const handleShowReport = useCallback(() => {
    onApplyFilter(selectedOptionsInner);
    setIsOpenModal(false);
  }, [selectedOptionsInner, onApplyFilter]);

  return (
    <div className='relative'>
      <FilterButton isSelected={isSelected} onClick={openModal} icon={icon}>
        {label}
      </FilterButton>
      {isOpenModal && (
        <OutsideClickHandler onOutsideClick={closeModal}>
          <div className='w-[225px] px-5 py-2 absolute left-0 bg-[#FFFFFF] shadow-xl z-40 rounded-md'>
            <div className='overflow-y-scroll max-h-[150px]'>
              {options.map(option => {
                const { value, label } = option;
                const checked = selectedOptionsInner.includes(value);

                const handleCheckboxChange = () => {
                  if (singleSelect) {
                    setSelectedOptionsInner([value]);
                    return;
                  }

                  const newSelectedOptions = checked
                    ? selectedOptionsInner.filter(selectedOption => selectedOption !== value)
                    : [...selectedOptionsInner, value];
                  setSelectedOptionsInner(newSelectedOptions);
                };

                return (
                  <div key={value} className='flex flex-col pl-2 my-2'>
                    <div className='flex'>
                      <input
                        className='cursor-pointer w-5 h-5 capitalize'
                        type='checkbox'
                        checked={checked}
                        id={value}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor={value} className='ml-10 text-[14px]'>
                        {label}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleShowReport}
              className='px-[16px] my-2 py-[8px] bg-[#4D4AEA] font-medium rounded-md w-[188px] text-[14px] text-[#fff] disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Apply Filter
            </button>
          </div>
        </OutsideClickHandler>
      )}
    </div>
  );
};

const FilterButton = ({ onClick, isSelected, icon: Icon, children }) => {
  return (
    <button
      onClick={onClick}
      className={`flex gap-1 ${isSelected ? 'bg-[#4D4AEA0D] rounded-md py-2 px-3' : 'py-2 px-3'}`}
    >
      {Icon && (
        <span>
          <Icon style={{ width: '16px', height: '16px' }} />
        </span>
      )}
      {children}
    </button>
  );
};

export { FilterItem };
