import React from 'react';

export default function SmallLabel({ value, className, children, semi, htmlFor }) {
    const classes = ['small-label'];
    if (className) classes.push(className);
    if (semi) classes.push('semibold');
    return (
        <label className={classes.join(' ')} value={value} htmlFor={htmlFor}>
            {children}
        </label>
    );
}
