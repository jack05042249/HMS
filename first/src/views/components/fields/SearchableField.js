import React, { useMemo, useState } from 'react';

import icons from '../../../icons';

const SearchableField = ({ name, onChangeSelectedKeys, data = [], selectedKeys = [], emptyText = 'Select' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const { value } = item;
      if (value.toLocaleLowerCase().includes(filter.toLocaleLowerCase())) {
        return true;
      }
      return null;
    });
  }, [data, filter]);

  return (
    <>
      <label htmlFor='cusIds' className='text-[#000] text-[14px] font-medium text-left mb-[8px]'>
        {name}
      </label>
      <div id='customers_to_select' className='multiple-select w-full'>
        {selectedKeys.length ? (
          <div
            className='flex w-full flex-wrap justify-start text-gray-500 py-2 px-8 underline border border-[#F5F0F0] mb-4 text-[#9197B3] w-[313px] rounded-lg h-fit px-[15px] appearance-none outline-none'
            onClick={() => setIsOpen(prev => !prev)}
          >
            {selectedKeys.map((key, i) => {
              return (
                <div key={key} className={`flex items-center${i === 0 ? '' : ' ml-2'}`}>
                  <div>{data.find(d => d.key === key)?.value}</div>
                  {i < selectedKeys.length - 1 && <div className='mx-1'>,</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <span
            onClick={() => setIsOpen(prev => !prev)}
            className='min-h-[40px] w-full flex justify-start text-gray-500 py-2 px-8 items-center underline border mb-4 border-[#F5F0F0] text-[#9197B3] w-[313px] rounded-lg h-auto px-[15px] appearance-none outline-none'
          >
            {emptyText}
          </span>
        )}

        {isOpen && (
          <div className='multiple-select border-x border-[#F5F0F0] relative bottom-4 max-h-[125px] overflow-auto customer-select  px-1 bg-[#fff]'>
            <div className='border rounded border-[#F5F0F0] mb-2 flex items-center mt-1'>
              <span>
                <icons.search />
              </span>
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder='Search'
                className='outline-none ml-2.5 text-[14px] w-[200px]'
                type='text'
              />
            </div>
            {filteredData.map(item => {
              const { key, value } = item;

              return (
                <div key={key} className='flex flex-col'>
                  <div className='flex'>
                    <input
                      className='cursor-pointer'
                      type='checkbox'
                      checked={selectedKeys.includes(key)}
                      onChange={e => {
                        const isChecked = e.target.checked;
                        onChangeSelectedKeys(isChecked ? [...selectedKeys, key] : selectedKeys.filter(k => k !== key));
                      }}
                      id={key}
                    />
                    <label htmlFor={key} className='ml-10'>
                      {value}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export { SearchableField };
