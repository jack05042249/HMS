import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import icons from '../../../icons';

import './genericModal.scss';

function GenericModal(props) {

    const handleKeyUp = useCallback(
        e => {
            if (e.key === 'Escape') {
            }
        },
        []
    );

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);
        return () => window.removeEventListener('keyup', handleKeyUp);
    }, [handleKeyUp]);

    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => document.body.classList.remove('modal-open');
    });

    const closeModal = e => {
        if (e) e.stopPropagation();
        if (!props.modalIsLocked) props.closeModal();
    };

    const divStyle = {
        display: props.displayModal ? 'block' : 'none'
    };

    const classes = ['basic-modal'];
    if (props.animated) classes.push('animated fadeIn');
    if (props.className) classes.push(props.className);

    return (
        <div
            className={classes.join(' ')}
            id={props.id}
            // onClick={() => (props.disabledCloseOnClickBackground ? null : closeModal())}
            style={divStyle}
        >
            <div
                className='basic-modal-content'
                onClick={e => e.stopPropagation()}
            >
                <button type="button" className="close" aria-label="Close" onClick={closeModal}>
                    <span className="w-[34px] h-[34px]"><icons.closeModal/></span>
                </button>
                {props.children}
            </div>
        </div>
    );
}

GenericModal.propTypes = {
    id: PropTypes.string,
    displayModal: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    children: PropTypes.element,
};
export default GenericModal;
