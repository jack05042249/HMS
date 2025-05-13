import { lazy } from "react"
const Profile = lazy(() => import('../talentProfile/talent-profile'))
const FeedbackModalWithTokenValidation = lazy(() => import('../feedback/feedback-modal-cloak'));

const routes = [
  {
    path: '/profile',
    Component: Profile,
    name: '/talent/profile'
  },
  {
    path: '/feedback',
    Component: FeedbackModalWithTokenValidation,
    name: 'Fb modal'
  }
]
export default routes