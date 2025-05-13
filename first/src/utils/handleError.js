import axios from "axios"
import { resetState } from "../store/actionCreator"
import { localStorageHelper } from "./localStorage"

export const handleError = (err, dispatch, history) => {
    if (err?.response?.status === 401) {
        localStorageHelper.clear()
        axios.defaults.headers.common['Authorization'] = 'notvalidtoken'
        dispatch(resetState())
        history.push('/login')
    }
}