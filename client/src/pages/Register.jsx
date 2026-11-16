import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router';

import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../contexts/authContext';
import { registerSchema } from '../schemas/authSchema';

function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [registerError, setRegisterError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      setRegisterError('');
      const res = await axiosInstance.post('/users/register', data);

      console.log(res.data.data);
      setUser(res.data.data);
      toast.success('Successfully created!');

      reset();

      navigate('/login');
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        'Something went wrong. Please try again.';

      setRegisterError(message);
      toast.error(message);
    }
  };

  return (
    <div
      id="register-page"
      className="flex-1 flex flex-col justify-center items-center"
    >
      <div className="w-full max-w-100 border border-slate-300 rounded-md shadow-md px-5 py-2.5">
        <h1 className="text-2xl font-bold mb-2">Sign up</h1>

        {registerError && (
          <p
            id="register-error"
            className="text-red-500 text-sm mb-2"
            role="alert"
          >
            {registerError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          {/* Full Name */}
          <label htmlFor="fullname-input">Name</label>
          <input
            className="border border-slate-400 rounded-md px-2 py-1"
            id="fullname-input"
            type="text"
            required
            aria-invalid={!!errors.fullName}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm" role="alert">
              {errors.fullName.message}
            </p>
          )}

          {/* Email */}
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

          {/* Username */}
          <label htmlFor="username-input">Username</label>
          <input
            className="border border-slate-400 rounded-md px-2 py-1"
            id="username-input"
            type="text"
            required
            aria-invalid={!!errors.username}
            {...register('username')}
          />
          {errors.username && (
            <p className="text-red-500 text-sm" role="alert">
              {errors.username.message}
            </p>
          )}

          {/* Password */}
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

          {/* Submit and Login Link */}
          <div className="flex items-center justify-between mt-2">
            <button
              id="register-button"
              disabled={isSubmitting}
              className="min-w-25 text-xs rounded-md bg-blue-400 text-white font-semibold py-1 px-2 hover:bg-blue-500 cursor-pointer hover:shadow-xl hover:shadow-blue-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
            >
              {isSubmitting ? 'Registering...' : 'Submit'}
            </button>

            <p className="text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
