import React, { useState } from 'react';

const Authorization: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('dj');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrorMessage(''); // Clear error message when toggling forms
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(''); // Reset error message
    try {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        // Handle successful login here
        alert('Login successful');
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Failed to login');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred during login');
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(''); // Reset error message
    try {
      const response = await fetch('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, role }),
      });
      if (response.ok) {
        // Handle successful registration here
        alert('Registration successful');
        setIsLogin(true); // Switch to login form after successful registration
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Failed to register');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      {errorMessage && <div className="mb-4 text-red-500">{errorMessage}</div>}
      <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
        />
        {!isLogin && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="select"
              required
            >
              <option value="dj">DJ</option>
              <option value="event-manager">Event Manager</option>
            </select>
          </>
        )}
        <div className="flex justify-between items-center">
          <button type="submit" className="btn bg-blue-500 text-white">
            {isLogin ? 'Login' : 'Register'}
          </button>
          <button type="button" onClick={toggleForm} className="btn underline">
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Authorization;
