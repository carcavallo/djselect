import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifier } from './useNotifier';
import { useUserRole } from './useUserRole';
import EventManager from './roles/EventManager';
import DJ from './roles/DJ';
import Administrator from './roles/Administrator';

const Dashboard: React.FC = () => {
  const { role } = useUserRole();
  const navigate = useNavigate();
  const { notifyError } = useNotifier();

  useEffect(() => {
    if (!role) {
      notifyError('Unauthorized access. Please log in.');
      navigate('/');
    }
  }, [role, navigate, notifyError]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {role === 'event_manager' && <EventManager />}
      {role === 'dj' && <DJ />}
      {role === 'administrator' && <Administrator />}
      {!role && <div>Checking authorization...</div>}
    </div>
  );
};

export default Dashboard;
