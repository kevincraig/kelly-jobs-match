import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAmplifyAuth } from '../hooks/useAmplifyAuth';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const { signIn } = useAmplifyAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="w-1/2 flex flex-col justify-center items-center px-8 py-12">
      {/* Logo and App Name */}
      <div className="flex items-center mb-8">
        <img src="/kelly-logo.svg" alt="Kelly Jobs Match Logo" className="h-15 w-15 mr-2" />
        <span className="text-lg font-semibold text-gray-800">Jobs Match</span>
      </div>
      {/* Welcome Message */}
      <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
      <p className="text-gray-500 mb-8">Login to be matched with the best jobs</p>
      {/* Login Form Fields */}
      <form 
        className="space-y-6 w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const email = formData.get('email') as string;
          const password = formData.get('password') as string;
          const rememberMe = formData.get('rememberMe') === 'on';
          
          const submitButton = e.currentTarget.querySelector('button[type="submit"]');
          
          if (submitButton) {
            submitButton.classList.add('opacity-75', 'scale-95', 'cursor-not-allowed');
            submitButton.setAttribute('disabled', 'true');
            submitButton.textContent = 'Signing in...';
          }
          
          setLoginError(null);
          
          try {
            await signIn(email, password);
            if (rememberMe) {
              localStorage.setItem('rememberedEmail', email);
            } else {
              localStorage.removeItem('rememberedEmail');
            }
            onSuccess?.();
            navigate('/'); // Navigate to home page after successful login
          } catch (error) {
            console.error('Login failed:', error);
            setLoginError(error instanceof Error ? error.message : 'Invalid email or password');
            onError?.(error as Error);
          } finally {
            if (submitButton) {
              submitButton.classList.remove('opacity-75', 'scale-95', 'cursor-not-allowed');
              submitButton.removeAttribute('disabled');
              submitButton.textContent = 'Sign In';
            }
          }
        }}
      >
        <div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kelly"
            defaultValue={localStorage.getItem('rememberedEmail') || ''}
            required
          />
        </div>
        <div>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kelly"
              required
            />
            <button
              type="button"
              className="absolute right-3 bg-transparent top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 hover:bg-kelly-50 focus:outline-none"
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-gray-600">
            <input 
              name="rememberMe"
              type="checkbox" 
              className="mr-2 rounded border-gray-300 focus:ring-kelly"
              defaultChecked={!!localStorage.getItem('rememberedEmail')}
            />
            Remember me
          </label>
          <a href="/reset-password" className="text-sm text-kelly hover:underline">Forgot Password?</a>
        </div>
        {loginError && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {loginError}
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-kelly text-white font-semibold text-lg hover:bg-kelly-dark transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow focus:outline-none focus:ring-2 focus:ring-kelly disabled:opacity-75 disabled:cursor-not-allowed"
        >
          Sign In
        </button>
      </form>
      <div className="mt-8 text-center w-full">
        <span className="text-sm text-gray-500">Don&apos;t have an account? </span>
        <a href="/register" className="text-sm text-kelly font-semibold hover:underline">Sign Up</a>
      </div>
    </div>
  );
}

export default LoginForm; 