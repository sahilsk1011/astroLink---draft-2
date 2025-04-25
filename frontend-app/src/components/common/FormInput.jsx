import React from 'react';

const FormInput = ({ 
  label, 
  type = 'text', 
  id, 
  value, 
  onChange, 
  required = false, 
  error = null,
  ...props 
}) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        {...props}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default FormInput;