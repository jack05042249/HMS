import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import './bottomButtons.scss'
import SmallLoader from '../../loaders/SmallLoader'

const super_dark_grey = '#292828'


const BottomButtons = ({ buttonText = 'Add', apply, cancel, showDeleteButton, deleteInstance, extra = false }) => {
    const [loading, setLoading] = useState(false)

    const onClickHandler = async (sendMail) => {
        setLoading(true)
        await apply(sendMail)
        setLoading(false)
    }
    return (
        <div id="bottom_buttons">
            <button className='btn grey-button' onClick={() => onClickHandler()} disabled={loading}>{loading ? <SmallLoader tiny /> : buttonText}</button>
            {extra && <div className='flex'>
                <button className='btn grey-button ml-10' onClick={() => onClickHandler('2 weeks')} disabled={loading}>{loading ? <SmallLoader tiny /> : 'Save and send 2 weeks notifications'}</button>
                <button className='btn grey-button ml-10' onClick={() => onClickHandler('annual')} disabled={loading}>{loading ? <SmallLoader tiny /> : 'Save and send annual notifications'}</button>
            </div>}
            <button className='btn ml-10' onClick={cancel}>Cancel</button>
            {showDeleteButton && <div className='ml-10 align-center pointer' onClick={deleteInstance}>
                <FontAwesomeIcon icon={faTrash} color={super_dark_grey} size="xl" />
            </div>}
        </div>
    )
}

export default BottomButtons