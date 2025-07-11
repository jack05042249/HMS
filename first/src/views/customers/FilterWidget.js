import { FilterItem, FilteredByItem } from '../components/filter';

const FilterWidget = ({ inactiveValues, onApplyInactiveValues }) => {
  return (
    <div className='flex flex-col font-medium text-[12px]'>
      <div className='flex gap-2 items-center relative'>
        <p>Filters:</p>

        <FilterItem
          isSelected={false}
          label='Inactive'
          options={[
            { value: true, label: 'Checked' },
            { value: false, label: 'Not Checked' }
          ]}
          selectedOptions={inactiveValues}
          onApplyFilter={onApplyInactiveValues}
        />
      </div>
      <div className='flex justify-start mt-2.5 items-center'>
        <div className='flex whitespace-nowrap'>
          <span className='mr-2'>Filtered by:</span>
          <div className='flex flex-col gap-1'>
            <FilteredByItem
              selectedItems={inactiveValues}
              getLabel={item => (item ? 'Checked' : 'Not Checked')}
              label='Inactive'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { FilterWidget };
