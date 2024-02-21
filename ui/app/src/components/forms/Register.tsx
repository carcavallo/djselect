import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterProps {
  onToggle: () => void;
}

const Register: React.FC<RegisterProps> = ({ onToggle }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('dj');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, email, role }),
      });
      if (response.ok) {
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Failed to register');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Register your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <button onClick={onToggle} className="font-medium text-indigo-600 hover:text-indigo-500">
            sign in to your existing account
          </button>
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleRegister}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <input
              id="username-register"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <input
              id="password-register"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="pt-4">
            <select
              id="role"
              name="role"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="dj">DJ</option>
              <option value="event_manager">Event Manager</option>
            </select>
          </div>
        </div>
        {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
