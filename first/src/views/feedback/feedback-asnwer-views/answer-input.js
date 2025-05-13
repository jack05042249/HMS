const AnswerInputView = ({ answers, sectionKey, questionKey, handleChange }) => {
  return (
    <div className='flex flex-col mt-8 w-full'>
      <input
        onChange={handleChange}
        value={answers || ''}
        id={`${sectionKey}-${questionKey}`}
        name={`${sectionKey}-${questionKey}`}
        placeholder='Answer here'
        className='border text-[12px] bg-[#DCE5F4] mb-4 w-full rounded-lg py-4 px-4 appearance-none outline-[#100073] placeholder:text-[#0f00734f]'
      />
    </div>
  );
};

export default AnswerInputView;
