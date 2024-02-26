import React, { useState } from 'react';
import Login from './forms/Login';
import Register from './forms/Register';
import PasswordResetRequest from './forms/PasswordResetRequest';

const FORM_TYPES = {
  LOGIN: 'login',
  REGISTER: 'register',
  RESET_PASSWORD: 'resetPassword',
};

const Authentication: React.FC = () => {
  const [currentForm, setCurrentForm] = useState<string>(FORM_TYPES.LOGIN);

  const toggleForm = () => {
    if (currentForm === FORM_TYPES.LOGIN) {
      setCurrentForm(FORM_TYPES.REGISTER);
    } else if (currentForm === FORM_TYPES.REGISTER) {
      setCurrentForm(FORM_TYPES.LOGIN);
    }
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
