import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import EventManager from './roles/EventManager';
import DJ from './roles/DJ';
import Administrator from './roles/Administrator';

const Dashboard: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { 
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
