import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { authAPI } from '../../services/api';
import { validateRegisterForm } from '../../utils/validation';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'client'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateRegisterForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setServerError('');
    
    try {
      await authAPI.register(formData);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.response?.data?.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Create Your Account</h2>
      
      {serverError && <div className="alert alert-danger">{serverError}</div>}
      {success && <div className="alert alert-success">Registration successful! Redirecting to login...</div>}
      
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Email"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          error={errors.email}
        />
        
        <FormInput
          label="Password"
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Choose a password (min. 6 characters)"
          required
          error={errors.password}
        />
        
        <div className="form-group">
          <label htmlFor="role">I am a:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`form-control ${errors.role ? 'is-invalid' : ''}`}
          >
            <option value="client">Client seeking consultation</option>
            <option value="astrologer">Astrologer offering services</option>
          </select>
          {errors.role && <div className="invalid-feedback">{errors.role}</div>}
        </div>
        
        <div className="form-group form-check">
          <input 
            type="checkbox" 
            className="form-check-input" 
            id="terms" 
            required 
          />
          <label className="form-check-label" htmlFor="terms">
            I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
          </label>
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || success}
          className="btn-primary btn-block"
        >
          {isSubmitting ? 'Creating Account...' : 'Register'}
        </Button>
      </form>
      
      <div className="auth-links">
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;