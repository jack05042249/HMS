import icons from '../../icons';
import history from '../../utils/browserHistory';
import '../talentProfile/success-modal.scss'

const FeedbackConfirm = () => {
  const handleOkClick = () => {
    history.push('/talent/profile');
  };

  return (
    <div className="success-modal">
      <div className="success-modal-content">
        <div className="flex flex-col justify-center items-center p-5">
          <span className="mb-4"> <icons.feedbackHeart style={{stroke: "#4D4AEA"}}/> </span>
          <p className="text-[#333] text-[16px] font-medium">
            Thank You
          </p>
          <p className="text-[#333] text-[16px] font-medium">for Your Feedback!</p>
          <button onClick={() => handleOkClick()} className="px-[16px] py-[8px] bg-[#4D4AEA] rounded-md w-[100px] mt-6">
            <span className="text-[14px] font-medium text-[#fff]">OK</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackConfirm