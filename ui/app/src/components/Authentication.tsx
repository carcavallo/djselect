import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './forms/Login';
import Register from './forms/Register';
import PasswordResetRequest from './forms/PasswordResetRequest';
import { useUserRole } from './useUserRole';

const FORM_TYPES = {
  LOGIN: 'login',
  REGISTER: 'register',
  RESET_PASSWORD: 'resetPassword',
};

const Authentication: React.FC = () => {
  const [currentForm, setCurrentForm] = useState<string>(FORM_TYPES.LOGIN);
  const { role } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (role) {
      navigate('/dashboard');
    }
  }, [role, navigate]);

  const toggleForm = () => {
    setCurrentForm(currentForm === FORM_TYPES.LOGIN ? FORM_TYPES.REGISTER : FORM_TYPES.LOGIN);
  };

  const showPasswordResetForm = () => setCurrentForm(FORM_TYPES.RESET_PASSWORD);

  return (
    <>
      {currentForm === FORM_TYPES.LOGIN && <Login onToggle={toggleForm} onForgotPassword={showPasswordResetForm} />}
      {currentForm === FORM_TYPES.REGISTER && <Register onToggle={toggleForm} />}
      {currentForm === FORM_TYPES.RESET_PASSWORD && <PasswordResetRequest />}
    </>
  );
};

export default Authentication;
