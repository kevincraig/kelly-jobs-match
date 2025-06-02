import React, { useState } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';

const LoginForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      if (isForgotPassword) {
        console.log('[Login] Initiating password reset for:', formData.email);
        const response = await authAPI.forgotPassword(formData.email);
        setSuccessMessage('Password reset instructions have been sent to your email.');
        setIsForgotPassword(false);
      } else {
        console.log('[Login] Attempting login for:', formData.email);
        const response = await authAPI.login({ email: formData.email, password: formData.password });
        console.log('[Login] Full response:', response);
        if (response && response.token && response.user) {
          console.log('[Login] Login successful, token received:', !!response.token);
          console.log('[Login] User data received:', {
            id: response.user.id,
            email: response.user.email,
            firstName: response.user.firstName
          });
          onLogin(response.user, response.token);
        } else {
          throw new Error('Invalid response format from server');
        }
      }
    } catch (error) {
      console.error('[Login] Error:', error.response?.data?.message || error.message);
      setError(error.response?.data?.message || error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="bg-kelly p-3 rounded-lg inline-block mb-4">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Kelly Jobs Match
          </h2>
          <p className="mt-2 text-gray-600">
            {isForgotPassword 
              ? 'Reset your password'
              : isLogin 
                ? 'Sign in to your account' 
                : 'Create your account'
            }
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {successMessage}
            </div>
          )}
          {!isLogin && !isForgotPassword && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly bg-gray-50"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly bg-gray-50"
                  placeholder="Doe"
                />
              </div>
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 rounded-md h-11 border border-gray-300 bg-gray-50 shadow-sm focus:border-kelly focus:ring-2 focus:ring-kelly sm:text-sm"
                required
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 rounded-md h-11 border border-gray-300 bg-gray-50 shadow-sm focus:border-kelly focus:ring-2 focus:ring-kelly sm:text-sm pr-10"
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-kelly bg-transparent hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            <div className="flex flex-col space-y-3 mt-6">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-kelly hover:bg-kelly-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kelly transition"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Please wait...
                  </div>
                ) : (
                  isForgotPassword 
                    ? 'Send Reset Instructions'
                    : isLogin 
                      ? 'Sign In'
                      : 'Register'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setIsForgotPassword(false);
                  setError('');
                  setSuccessMessage('');
                  setFormData({ email: '', password: '', firstName: '', lastName: '' });
                }}
                className="w-full text-base text-kelly border border-kelly bg-white rounded-md py-2 px-4 hover:bg-kelly-50 transition"
              >
                {isForgotPassword 
                  ? 'Back to Sign In'
                  : isLogin 
                    ? 'Need an account? Register'
                    : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;