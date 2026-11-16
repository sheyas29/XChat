import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/authContext';

import axiosInstance from '../api/axiosInstance';
import { loginSchema } from '../schemas/authSchema';

function Login() {
  const navigate = useNavigate();
  const { setUser, fetchFirebaseCustomToken } = useAuth();
  const [loginError, setLoginError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      setLoginError('');
      const res = await axiosInstance.post('/users/login', data);
      await fetchFirebaseCustomToken();
      console.log(res.data.data);
      toast.success('Logged in successfully!');
      setUser(res.data.data.user);
      reset();
      navigate('/');
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        'Something went wrong. Please try again.';

      setLoginError(message);
      toast.error(message);
    }
  };

  return (
    <div
      id="login-page"
      className="flex-1 flex flex-col justify-center items-center"
    >
      <div className="w-full max-w-100 border border-slate-300 rounded-md shadow-md px-5 py-2.5">
        <h1 className="text-2xl font-bold mb-2">Sign in</h1>

        {loginError && (
          <p
            id="login-error"
            className="text-red-500 text-sm mb-2"
            role="alert"
          >
            {loginError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <label htmlFor="email-input">Email</label>
          <input
            className="border border-slate-400 rounded-md px-2 py-1"
            id="email-input"
            type="email"
            required
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-sm" role="alert">
              {errors.email.message}
            </p>
          )}

          <label htmlFor="password-input">Password</label>
          <input
            className="border border-slate-400 rounded-md px-2 py-1"
            id="password-input"
            type="password"
            required
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-500 text-sm" role="alert">
              {errors.password.message}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <button
              id="login-button"
              disabled={isSubmitting}
              className="min-w-25 text-xs rounded-md bg-blue-400 text-white font-semibold py-1 px-2 hover:bg-blue-500 cursor-pointer hover:shadow-xl hover:shadow-blue-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
            >
              {isSubmitting ? 'Logging in...' : 'Submit'}
            </button>

            <p className="text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
