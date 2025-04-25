import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { authAPI } from '../../services/api';
import { validateLoginForm } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const { login } = useAuth();
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
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setServerError('');
    
    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      
      // Update auth context and store token
      login(user, token);
      
      // Redirect based on user role
      if (user.role === 'client') {
        navigate('/client/dashboard');
      } else if (user.role === 'astrologer') {
        navigate('/astrologer/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setServerError(error.response?.data?.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login to Your Account</h2>
      {serverError && <div className="alert alert-danger">{serverError}</div>}
      
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
          placeholder="Enter your password"
          required
          error={errors.password}
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="btn-primary btn-block"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      
      <div className="auth-links">
        <p>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;