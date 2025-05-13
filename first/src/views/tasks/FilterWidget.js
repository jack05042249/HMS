import icons from '../../icons';
import { RISK, RISKS, STATUS, STATUSES, TYPE, TYPES } from '../../utils';
import { FilterItem, FilteredByItem } from '../components/filter';

const FilterWidget = ({
  hideTypeFilter,
  hideShowButton,
  types,
  onApplyTypes,
  statuses,
  onApplyStatuses,
  risks,
  onApplyRisks,
  disabled,
  onClick
}) => {
  return (
    <div className='flex flex-col font-medium text-[12px]'>
      <div className='flex gap-2 items-center relative'>
        <p>Filters:</p>
        {hideTypeFilter ? null : (
          <FilterItem
            isSelected={false}
            icon={icons.type}
            label='Type'
            options={TYPES}
            selectedOptions={types}
            onApplyFilter={onApplyTypes}
          />
        )}

        <FilterItem
          isSelected={false}
          icon={icons.status}
          label='Status'
          options={STATUSES}
          selectedOptions={statuses}
          onApplyFilter={onApplyStatuses}
        />
        <FilterItem
          isSelected={false}
          icon={icons.risk}
          label='Risk'
          options={RISKS}
          selectedOptions={risks}
          onApplyFilter={onApplyRisks}
        />
        {!hideShowButton && (
          <button
            disabled={disabled}
            className='text-[#fff] bg-[#4D4AEA] px-[45px] py-1.5 rounded-md disabled:opacity-40 disabled:cursor-not-allowed'
            onClick={onClick}
          >
            Show Tasks
          </button>
        )}
      </div>
      <div className='flex justify-start mt-2.5 items-center'>
        <div className='flex whitespace-nowrap'>
          <span className='mr-2'>Filtered by:</span>
          <div className='flex flex-col gap-1'>
            {hideTypeFilter ? null : (
              <FilteredByItem selectedItems={types} getLabel={item => TYPE[item].label} icon={icons.type} />
            )}
            <FilteredByItem selectedItems={statuses} getLabel={item => STATUS[item].label} icon={icons.status} />
            <FilteredByItem selectedItems={risks} getLabel={item => RISK[item].label} icon={icons.risk} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { FilterWidget };
