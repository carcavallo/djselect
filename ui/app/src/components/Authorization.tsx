import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Authorization: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <>
      {isLogin ? <Login onToggle={toggleForm} /> : <Register onToggle={toggleForm} />}
    </>
  );
};

export default Authorization;
