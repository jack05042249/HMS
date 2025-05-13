import React, { Fragment } from 'react';

const FeedBackViewV1 = ({ data }) => {
  return (
    <div className='text-[12px] grid grid-cols-2 gap-x-[6rem]'>
      {data &&
        data.map(({ question, answer, id }) => {
          return (
            <Fragment key={id}>
              <div className='my-4'>
                <p className='text-[#000000] font-medium max-w-[450px]'> {question} </p>
              </div>
              <div className='my-4'>
                <p className='text-[#333333] first-letter:uppercase'> {answer ? answer : 'No answer provided'} </p>
              </div>
            </Fragment>
          );
        })}
    </div>
  );
};

export { FeedBackViewV1 };
