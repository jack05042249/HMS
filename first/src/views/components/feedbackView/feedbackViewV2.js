import React from 'react';

const FeedBackViewV2 = ({ data }) => {
  return (
    <div className='text-[12px]'>
      <table className='w-full'>
        <tbody>
          {data.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              {/* Render the section title as a separate row */}
              <tr>
                <td colSpan='2' style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                  {section.title}
                </td>
              </tr>
              {/* Render each question and answer under the section */}
              {section.answers.map((answerObj, answerIndex) => (
                <tr key={answerIndex}>
                  <td>{answerObj.question}</td>
                  <td>{answerObj.answer}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { FeedBackViewV2 };
