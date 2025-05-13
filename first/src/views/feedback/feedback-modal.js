import { useEffect, useState } from 'react';
import config from '../../config';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { pushQuestionsData } from '../../store/actionCreator';
import FeedbackConfirm from './feedback-confirm';
import iconsObj from '../../icons';
import PageStartLoader from '../loaders/PageStartLoader';
import AnswerInputView from './feedback-asnwer-views/answer-input';
import AnswerRadioView from './feedback-asnwer-views/answer-radio';
import AnswerScaleView from './feedback-asnwer-views/answer-scale';

const API_URL = config.API_URL;

const FeedbackModal = () => {
  const { questions } = useSelector(state => state);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const [showSuccessRequest, setShowSuccessRequest] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const initValues = {
    section1: {},
    section2: {},
    section3: {},
    section4: {},
    section5: {},
    section6: {},
    section7: {},
    section8: {}
  };

  const initState = { values: initValues };
  const [formState, setFormState] = useState(initState);
  const { values } = formState;

  const handleChangeForm = ({ target }) => {
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [target.name.split('-')[0]]: {
          ...prev.values[target.name.split('-')[0]],
          [target.name.split('-')[1]]: target.value
        }
      }
    }));
  };

  const handleRadioChange = (category, questionName, value) => {
    setFormState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values,
        [category]: {
          ...prevState.values[category],
          [questionName]: value
        }
      }
    }));
  };

  const handleScaleChange = (category, questionName, value) => {
    setFormState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values,
        [category]: {
          ...prevState.values[category],
          [questionName]: value
        }
      }
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feedbackQuestionsRes = await axios.get(`${API_URL}/feedback/questions`);
        dispatch(pushQuestionsData(feedbackQuestionsRes.data));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const sendFeedback = async () => {
    const requiredFields = Object.entries(questions)
      .map(([section, questionSection]) => {
        return Object.keys(questionSection.questions).map(key => ({
          section,
          key
        }));
      })
      .flat();

    const emptyFields = requiredFields.filter(({ section, key }) => {
      return !values[section] || !values[section][key];
    });
    if (emptyFields.length > 0) {
      setError('Your feedback should have answers to all questions.');
      return;
    }
    const feedbackData = {
      token: token,
      answers: values
    };
    try {
      const feedbackResponse = await axios.put(`${API_URL}/feedback`, feedbackData);
      if (feedbackResponse.status === 201) {
        setError('');
        setShowSuccessRequest(!showSuccessRequest);
      }
    } catch (e) {
      setError('Network error. Please try again later.');
      console.log('Unexpected runtime server error', e);
    }
  };

  if (!questions) {
    return <PageStartLoader />;
  }

  return (
    <div className='w-full h-full fixed bg-[#fafbffe6] z-100 top-0 left-0 overflow-y-auto'>
      {showSuccessRequest && <FeedbackConfirm />}
      <div className='bg-[#DCE5F4] relative top-[5%] w-[75%] m-auto px-28 pb-10 shadow-lg drop-shadow-md rounded-3xl'>
        <div className='flex gap-10 justify-end items-end pb-20'>
          <div className='h-56 w-52 bg-[#100073] rounded-b-3xl'>
            <div className='flex justify-center items-center h-full'>
              <iconsObj.feedbackCoin style={{ width: '150px', height: '150px' }} />
            </div>
          </div>
          <h1 className='text-[#100073] font-bold text-5xl uppercase text-start flex justify-center items-center'>
            <span>
              Share Your <span className='text-[#C91517]'>Feedback</span> with Us
            </span>
          </h1>
        </div>
        <div className='flex flex-col gap-8'>
          {Object.entries(questions).map(([section, questionSection]) => {
            return (
              <div
                className=' bg-[#EDF2FA] text-[#100073] rounded-3xl py-8 px-12 flex flex-col gap-2 justify-center items-start'
                key={questionSection.title}
              >
                <div className='w-full flex flex-col justify-start items-start'>
                  <label className=' text-xl font-bold uppercase w-full text-start'>
                    {questionSection?.title || ''}
                  </label>
                  {Object.keys(questionSection.questions).map(key => {
                    return (
                      <div
                        className={`flex gap-10 w-full pb-10 items-start ${
                          questionSection.questions[key].answers === 'input' ||
                          questionSection.questions[key].answers?.length === 10
                            ? 'flex-col'
                            : 'flex-row'
                        } `}
                        key={`${key}-${section}`}
                      >
                        <p className=' text-start pb-4 pt-2 mt-2 border-t-2 border-[#100073] w-[70%]'>
                          {questionSection.questions[key].question}
                        </p>
                        {questionSection.questions[key].answers === 'input' ? (
                          <AnswerInputView
                            answers={values[section][key] || []}
                            sectionKey={section}
                            questionKey={key}
                            handleChange={handleChangeForm}
                          />
                        ) : questionSection.questions[key].answers?.length === 10 ? (
                          <AnswerScaleView
                            answers={questionSection.questions[key].answers}
                            sectionKey={section}
                            questionKey={key}
                            handleChange={handleScaleChange}
                            selectedValue={values[section][key]}
                          />
                        ) : (
                          <AnswerRadioView
                            answers={questionSection.questions[key].answers}
                            sectionKey={section}
                            questionKey={key}
                            handleChange={handleRadioChange}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {/* Referral Program */}
          <div className=' bg-[#EDF2FA] text-[#100073] rounded-3xl py-8 px-12 flex flex-col gap-2 justify-center items-start'>
            <div className='w-full flex flex-col justify-start items-start'>
              <label className=' text-xl font-bold uppercase w-full text-start'>Referral Bonus Program</label>
              <div className={`flex flex-col gap-10 w-full pb-10 `}>
                <p className=' text-start pb-4 pt-2 mt-2 border-t-2 border-[#100073] w-[70%]'>
                  Are there any current job openings within the company that you would recommend or refer us to? Please
                  share the details.
                </p>
              </div>
              <div className='flex gap-8 px-8 py-6 items-center justify-start bg-[#DCE5F4] border border-[#100073] rounded-lg w-full'>
                <iconsObj.referalProgram style={{ width: '80px', height: '80px' }} />
                <div className='text-start'>
                  <h2 className='text-start text-xl font-bold uppercase'>Be part of our referral bonus program</h2>
                  <a
                    className='text-start text-sm font-normal underline'
                    href='https://www.notion.so/it-soft/Referral-Program-2c5eadb332c7469797a7c9cb558a6dad'
                    target='_blank'
                  >
                    For more details click here
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button onClick={sendFeedback} className='mt-10 bg-[#100073] text-white font-bold py-4 px-44 rounded-lg'>
          Submit
        </button>
        {error ? <div className='mt-4 text-red-500'>{error}</div> : <div className='mt-10'></div>}
      </div>
    </div>
  );
};

export default FeedbackModal;
