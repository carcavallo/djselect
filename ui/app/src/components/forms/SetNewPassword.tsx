import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNotifier } from "../helpers/useNotifier";
import { confirmResetPassword } from "../helpers/apiService";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SetNewPassword: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { notifyError, notifySuccess } = useNotifier();
  const query = useQuery();
  const token = query.get("token");

  const handleSetNewPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      notifyError("Passwords do not match");
      return;
    }

    try {
      await confirmResetPassword({ token: token!, password });
      notifySuccess("Password has been reset successfully.");
    } catch (error: any) {
      notifyError(
        error.message || "An error occurred during the password reset process"
      );
    }
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-8 p-6 sm:p-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Set New Password
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSetNewPassword}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Set New Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetNewPassword;
