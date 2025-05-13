const AnswerRadioView = ({ answers, sectionKey, questionKey, handleChange }) => {
  return (
    <div className='flex flex-col gap-2' key={sectionKey + '-' + questionKey}>
      {answers.map((answer, answerIndex) => {
        return (
          <div className='inline-flex items-center' key={sectionKey + '-' + questionKey + '' + answerIndex}>
            <label className='relative flex items-center p-1 rounded-full cursor-pointer' key={answerIndex}>
              <input
                className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full bg-[#DCE5F4] border border-3 border-blue-gray-200 text-[#100073] transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-8 before:w-8 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#100073] checked:before:bg-[#100073] hover:before:opacity-10"
                type='radio'
                name={`${sectionKey}-${questionKey}`}
                value={answer}
                onChange={() => handleChange(sectionKey, questionKey, answer)}
              />
              <span className='absolute text-[#100073] transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-3.5 w-3.5' viewBox='0 0 16 16' fill='currentColor'>
                  <circle data-name='ellipse' cx='8' cy='8' r='6'></circle>
                </svg>
              </span>
            </label>
            <span className='text-[#000] text-[14px]'>{answer}</span>
          </div>
        );
      })}
    </div>
  );
};

export default AnswerRadioView;
