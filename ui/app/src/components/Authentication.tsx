import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from './useUserRole';
import Login from './forms/Login';
import Register from './forms/Register';


const Authentication: React.FC = () => {
  const { role, notifySuccess } = useUserRole();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (role) {
      notifySuccess('Already logged in.')
      navigate('/dashboard');
    }
  }, [role, navigate, notifySuccess]);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <>
      {isLogin ? <Login onToggle={toggleForm} /> : <Register onToggle={toggleForm} />}
    </>
  );
};

export default Authentication;
