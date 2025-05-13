import React from 'react';

import icons from '../../../icons';

import './messageNotification.scss';

const MessageNotification = () => {
    const toggle = e => {
        const div = document.getElementById('message_notification');
        div.classList.remove('open-animation');
        div.classList.add('close-animation');
    };

    return (
        <div id="message_notification" onClick={toggle}>
            <div className="body">
                <div className="icon">
                    <icons.done id="message_notification_success_icon" />
                    <icons.roundClose id="message_notification_error_icon" />
                </div>
                <span id="message_notification_title" className="title"></span>
                <div id="message_notification_content"></div>
            </div>
            <div className="close-button">
                <icons.close />
            </div>
        </div>
    );
};

export default MessageNotification;
