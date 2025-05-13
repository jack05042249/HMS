import React from 'react';

import './loader.css';

const SmallLoader = ({ tiny = false }) => {
    const classes = ['spinner-border'];
    if (tiny) classes.push('tiny');
    return <div className={classes.join(' ')}></div>;
};

export default SmallLoader;
