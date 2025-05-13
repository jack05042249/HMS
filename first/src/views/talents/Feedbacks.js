import { useState, useLayoutEffect, useMemo } from 'react';
import moment from 'moment/moment';
import axios from 'axios';

import SmallLoader from '../loaders/SmallLoader';
import config from '../../config';
import { FeedbackStatus } from '../components/feedbackStatus';
import { FeedBackViewV1, FeedBackViewV2 } from '../components/feedbackView';

const Feedbacks = ({ talentId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    const fetchFeedbacks = () => {
      setIsLoading(true);
      axios
        .get(`${config.API_URL}/feedback/${talentId}`)
        .then(({ data }) => {
          setIsLoading(false);
          setFeedbacks(data);
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    fetchFeedbacks();
  }, [talentId]);

  const sortedFeedbacks = useMemo(() => {
    return feedbacks.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [feedbacks]);

  if (isLoading) {
    return (
      <div className='h-72 flex items-center justify-center'>
        <SmallLoader />
      </div>
    );
  }

  if (error) {
    return <p>Failed to load feedbacks</p>;
  }

  if (feedbacks.length === 0) {
    return <p>No feedbacks yet</p>;
  }

  return (
    <div className='text-sm text-left max-w-[900px] max-h-[600px] overflow-auto px-3'>
      {sortedFeedbacks.map((feedback, index) => {
        return (
          <>
            <div key={feedback.id} className='flex flex-col gap-3 py-0.5'>
              <div className='flex gap-2 items-center'>
                <b>{index + 1}.</b>
                <div className='flex items-center justify-between w-full'>
                  <span>
                    <b>Year:</b> {moment(feedback.createdAt).format('YYYY')}
                  </span>
                  <span>
                    <b>Month</b> {moment(feedback.createdAt).format('MMMM')}
                  </span>
                  <div className='inline-flex items-center gap-1'>
                    <span>
                      <b>Status:</b> {feedback.status}
                    </span>
                    <FeedbackStatus status={feedback.status} />
                  </div>
                </div>
              </div>
              {feedback.version === 'v1' && <FeedBackViewV1 data={feedback.data} />}
              {feedback.version === 'v2' && <FeedBackViewV2 data={feedback.data} />}
            </div>
            {index !== feedbacks.length - 1 && (
              <div className='my-3 h-[1px] mx-2 bg-[linear-gradient(90deg,_theme(colors.white)_0%,_theme(colors.web-gray-divider)_8%,_theme(colors.web-gray-divider)_92%,_theme(colors.white)_100%)]' />
            )}
          </>
        );
      })}
    </div>
  );
};

export { Feedbacks };
