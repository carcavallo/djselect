import React, { useState } from 'react';
import { useUserRole } from './useUserRole';
import Login from './forms/Login';
import Register from './forms/Register';


const Authentication: React.FC = () => {
  const { role } = useUserRole();
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <>
      {role && isLogin ? <Login onToggle={toggleForm} /> : <Register onToggle={toggleForm} />}
    </>
  );
};

export default Authentication;
