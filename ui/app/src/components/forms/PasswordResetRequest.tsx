import React, { useState } from 'react';
import { useNotifier } from '../useNotifier';

const PasswordResetRequest: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const { notifyError, notifySuccess } = useNotifier();

  const handlePasswordResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:80/api/api/auth/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        notifySuccess('If the email is registered, you will receive a password reset link.');
        setTimeout(() => {
            window.location.href = '/';
        }, 4000);
      } else {
        const data = await response.json();
        notifyError(data.message || 'Failed to request password reset');
      }
    } catch (error: any) {
      notifyError(error.message || 'An error occurred during the password reset request');
    }
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-8 p-6 sm:p-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Request Password Reset</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handlePasswordResetRequest}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <input
              id="email-reset"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm min-h-[50px]"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Send Reset Link
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetRequest;
