const FilteredByItem = ({ selectedItems, getLabel, icon: Icon, label }) => {
  return (
    <div className='flex items-center gap-1.5'>
      {selectedItems.length > 0 && Icon && <Icon style={{ width: '16px', height: '16px' }} />}
      {selectedItems.length > 0 && label}
      <div className='flex gap-1 items-center max-w-[100px]'>
        {selectedItems.map((item, index) => (
          <div key={index} className='border border-gray-400 px-2 rounded-md drop-shadow'>
            <span>{getLabel(item)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { FilteredByItem };
