const AnswerScaleView = ({ answers, sectionKey, questionKey, handleChange, selectedValue }) => {
  return (
    <div className='flex flex-col gap-2' key={`${sectionKey}-${questionKey}`}>
      <div className='flex w-full gap-2'>
        <span className='text-sm'>{answers[0].replace(/[0-9]/g, '').trim()}</span>
        {answers.map(answer => {
          const isSelected = selectedValue === answer;
          return (
            <button
              key={`${sectionKey}-${questionKey}-${answer}`}
              className={`w-10 h-10 rounded-md flex items-center justify-center border border-transparent 
                ${isSelected ? 'bg-[#100073] text-[#DCE5F4]' : 'bg-[#DCE5F4] text-[#100073] hover:bg-[#cddbf2]'} 
                focus:outline-none focus:ring-2 focus:ring-[#100073] focus:ring-offset-2`}
              onClick={() => handleChange(sectionKey, questionKey, answer)}
            >
              {parseInt(answer)}
            </button>
          );
        })}
        <span className='text-sm'>{answers.at(-1).replace(/[0-9]/g, '').trim()}</span>
      </div>
    </div>
  );
};

export default AnswerScaleView;
