import iconsObj from '../../icons';
import { FilterItem, FilteredByItem } from '../components/filter';

const NoLinkedinFilterWidget = ({ type, onApplyType }) => {
  return (
    <div className='flex flex-col font-medium text-[12px]'>
      <div className='flex gap-2 items-center relative'>
        <p>Filters:</p>
        <FilterItem
          isSelected={false}
          icon={iconsObj.type}
          label='Type'
          options={[
            { value: true, label: 'Ignored' },
            { value: false, label: 'Not Ignored' }
          ]}
          selectedOptions={[type]}
          singleSelect
          onApplyFilter={([type]) => onApplyType(type)}
        />
      </div>
      <div className='flex justify-start mt-2.5 items-center'>
        <div className='flex whitespace-nowrap'>
          <span className='mr-2'>Filtered by:</span>
          <div className='flex flex-col gap-1'>
            <FilteredByItem
              selectedItems={[type]}
              getLabel={item => (item === true ? 'Ignored' : 'Not Ignored')}
              label='Type'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { NoLinkedinFilterWidget };
