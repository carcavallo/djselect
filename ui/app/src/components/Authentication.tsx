import React, { useState } from 'react';
import Login from './forms/Login';
import Register from './forms/Register';

const Authentication: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <>
      {isLogin ? <Login onToggle={toggleForm} /> : <Register onToggle={toggleForm} />}
    </>
  );
};

export default Authentication;
