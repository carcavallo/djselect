import React, { useState } from "react";
import { useAuth } from "../authentication/AuthContext";
import { useNotifier } from "../helpers/useNotifier";

interface LoginProps {
  onToggle: () => void;
  onForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggle, onForgotPassword }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { error, notifyError, notifySuccess } = useNotifier();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(username, password);
      notifySuccess("Logged in successfully.");
    } catch (error: any) {
      notifyError(error.message || "An error occurred during login");
    }
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-8 p-6 sm:p-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <button
            onClick={onToggle}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            register a new account
          </button>
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm min-h-[50px]"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm min-h-[50px]"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </div>
        <div className="mt-2 text-center text-sm text-gray-600">
          <button
            onClick={onForgotPassword}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot your password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
