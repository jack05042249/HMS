import React from 'react';

import './loader.css';

const PageStartLoader = () => {
    return (
      <div className="absolute top-[25rem] left-[53rem]">
        <div className="lds-roller centered-mobile">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
};

export default PageStartLoader;
