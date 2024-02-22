import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventManager from './roles/EventManager';
import DJ from './roles/DJ';
import Administrator from './roles/Administrator';
import { useUserRole } from './useUserRole';


const Dashboard: React.FC = () => {
  const { role, error } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
        navigate('/');
    }
  }, [error, navigate]);

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
