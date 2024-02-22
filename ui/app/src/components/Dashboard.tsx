import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventManager from './roles/EventManager';
import DJ from './roles/DJ';
import Administrator from './roles/Administrator';
import { useUserRole } from './useUserRole';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard: React.FC = () => {
  const { role, errorMessage } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (errorMessage === 'User ID not found in session' || errorMessage === 'Session error') {
        navigate('/');
    }
  }, [errorMessage, navigate]);

  switch (role) {
    case 'event_manager':
      return <EventManager />;
    case 'dj':
      return <DJ />;
    case 'administrator':
      return <Administrator />;
    default:
      return <></>;
  }
};

export default Dashboard;
