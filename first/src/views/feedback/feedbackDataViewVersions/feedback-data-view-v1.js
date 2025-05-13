import React, { Fragment } from 'react';
import { FeedBackViewV1 } from '../../components/feedbackView';

const FeedbackDataViewV1 = feedback => {
  const { data, talent } = feedback;
  return (
    <Fragment key={talent.id + feedback.id}>
      <tr className='bg-[#F3F7FD66]'>
        <td colSpan='6' className='pt-[20px] px-[80px]'>
          <FeedBackViewV1 data={data} />
        </td>
      </tr>
    </Fragment>
  );
};
export default FeedbackDataViewV1;
