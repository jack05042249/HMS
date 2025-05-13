import icons from '../../icons';

export const DeleteModal = ({ title, content, onCancel, onDelete, isDisabled }) => {
  return (
    <div className='success-modal'>
      <div className='success-modal-content'>
        <div className='flex'>
          <div className='relative top-0.5 mr-1'>
            {' '}
            <icons.deleteIcon style={{ width: '22px', height: '22px' }} />{' '}
          </div>
          <div className='flex justify-start flex-col'>
            <div className='flex justify-start items-center relative'>
              <h1 className='text-[#333] text-[20px] font-medium'>{title}</h1>
            </div>
            <h2 className='text-[14px] text-left font-medium font-[#000]'>Are you sure you want to delete?</h2>
            <p className='text-[#9197B3] text-[16px] text-left my-5'>{content}</p>
          </div>
        </div>
        <div className='flex items-center justify-center'>
          <button
            className='w-[120px] px-[16px] mr-2.5 py-[8px] border-[#E0E0E0] border rounded-lg font-medium text-[#020202] text-[14px]'
            onClick={onCancel}
          >
            No, Cancel
          </button>
          <button
            onClick={isDisabled ? undefined : onDelete}
            className={`px-[16px] py-[8px] ${
              !isDisabled ? 'bg-[#4D4AEA]' : 'bg-[#808080]'
            } font-medium rounded-md w-[120px] text-[14px] text-[#fff]`}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};
