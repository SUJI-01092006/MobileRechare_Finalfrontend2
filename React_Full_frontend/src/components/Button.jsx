import React from 'react';

const Button = ({ children, variant = 'primary', type = 'button', className = '', ...props }) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
