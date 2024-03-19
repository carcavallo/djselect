import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifier } from "../helpers/useNotifier";
import { requestPasswordReset } from "../helpers/apiService";

const PasswordResetRequest: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const { notifyError, notifySuccess } = useNotifier();
  const navigate = useNavigate();

  const handlePasswordResetRequest = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      await requestPasswordReset(email);
      notifySuccess(
        "If the email is registered, you will receive a password reset link."
      );
      navigate("/dashboard");
    } catch (error: any) {
      notifyError(
        error.message || "An error occurred during the password reset request"
      );
    }
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-8 p-6 sm:p-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Request Password Reset
        </h2>
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
