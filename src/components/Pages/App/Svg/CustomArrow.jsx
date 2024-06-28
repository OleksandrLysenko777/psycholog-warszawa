import React from 'react';

const CustomArrow = ({ className, style, onClick, icon }) => (
  <div
    className={className}
    style={{
      ...style,
      display: 'block',
      backgroundImage: `url(${icon})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'contain',
      width: '30px',
      height: '30px',
      zIndex: 10,
    }}
    onClick={onClick}
  />
);

export default CustomArrow;
