import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventManager from './roles/EventManager';
import DJ from './roles/DJ';
import Administrator from './roles/Administrator';
import { useUserRole } from './useUserRole';


const Dashboard: React.FC = () => {
  const { role, error, notifyError } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      notifyError(error);
      navigate('/');
    }
  }, [error, navigate, notifyError]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {role === 'event_manager' && <EventManager />}
      {role === 'dj' && <DJ />}
      {role === 'administrator' && <Administrator />}
    </div>
  );
};

export default Dashboard;
