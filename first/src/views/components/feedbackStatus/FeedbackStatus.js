import { Checked, NotChecked } from '../Checkboxes';

const FeedbackStatus = ({ status }) => {
  return (
    <>
      {status === 'answered' && <Checked />}
      {status === 'sent' && <NotChecked />}
      {status === 'resent' && (
        <div className='inline-flex items-center'>
          <label className='relative flex items-center p-3 rounded-full cursor-not-allowed' htmlFor='purple'>
            <input
              type='checkbox'
              className="before:content[''] peer relative h-5 w-5 cursor-not-allowed appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#4D4AEA] checked:bg-[#4D4AEA] checked:before:bg-purple-500 hover:before:opacity-10"
              id='purple-resent'
              checked={true}
              disabled={true}
            />
            <span className='absolute text-3xl text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100'>
              -
            </span>
          </label>
        </div>
      )}
      {status === 'overdue' && (
        <div className='inline-flex items-center'>
          <label className='relative flex items-center p-3 rounded-full cursor-not-allowed' htmlFor='purple'>
            <input
              type='checkbox'
              className="before:content[''] peer relative h-5 w-5 cursor-not-allowed appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#4D4AEA] checked:bg-[#4D4AEA] checked:before:bg-purple-500 hover:before:opacity-10"
              id='purple-overdue'
              checked={false}
              disabled={true}
            />
            <span className='absolute text-3xl text-red-500 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100'>
              &times;
            </span>
          </label>
        </div>
      )}
    </>
  );
};

export { FeedbackStatus };
