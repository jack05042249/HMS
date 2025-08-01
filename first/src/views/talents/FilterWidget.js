import { FilterItem, FilteredByItem } from '../components/filter';

const FilterWidget = ({
  ignoreValues,
  inactiveValues,
  linkedinProfileCheckedValues,
  canWorkOnTwoPositionsValues,
  onApplyIgnoreValues,
  onApplyCanWorkOnTwoPositions,
  onApplyInactiveValues,
  onApplyLinkedinProfileCheckedValues
}) => {
  return (
    <div className='flex flex-col font-medium text-[12px]'>
      <div className='flex gap-2 items-center relative'>
        <p>Filters:</p>
        <FilterItem
          isSelected={false}
          label='Can Work On Two Positions'
          options={[
            { value: true, label: 'Checked' },
            { value: false, label: 'Not Checked' }
          ]}
          selectedOptions={canWorkOnTwoPositionsValues}
          onApplyFilter={onApplyCanWorkOnTwoPositions}
        />

        <FilterItem
          isSelected={false}
          label='Linkedin Checked'
          options={[
            { value: true, label: 'Checked' },
            { value: false, label: 'Not Checked' }
          ]}
          selectedOptions={linkedinProfileCheckedValues}
          onApplyFilter={onApplyLinkedinProfileCheckedValues}
        />

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
        
        <FilterItem
          isSelected={false}
          label='Ignore'
          options={[
            { value: true, label: 'Checked' },
            { value: false, label: 'Not Checked' }
          ]}
          selectedOptions={ignoreValues}
          onApplyFilter={onApplyIgnoreValues}
        />

      </div>
      <div className='flex justify-start mt-2.5 items-center'>
        <div className='flex whitespace-nowrap'>
          <span className='mr-2'>Filtered by:</span>
          <div className='flex flex-col gap-1'>
            <FilteredByItem
              selectedItems={canWorkOnTwoPositionsValues}
              getLabel={item => (item ? 'Checked' : 'Not Checked')}
              label='Can Work On Two Positions'
            />
            <FilteredByItem
              selectedItems={linkedinProfileCheckedValues}
              getLabel={item => (item ? 'Checked' : 'Not Checked')}
              label='Linkedin Checked'
            />
            <FilteredByItem
              selectedItems={inactiveValues}
              getLabel={item => (item ? 'Checked' : 'Not Checked')}
              label='Inactive'
            />
            <FilteredByItem
              selectedItems={ignoreValues}
              getLabel={item => (item ? 'Checked' : 'Not Checked')}
              label='Ignore'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { FilterWidget };
