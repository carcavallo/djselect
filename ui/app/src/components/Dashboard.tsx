import React from 'react';
import EventManager from './roles/EventManager';
import DJ from './roles/DJ';
import Administrator from './roles/Administrator';
import { useUserRole } from './useUserRole';


const Dashboard: React.FC = () => {
  const { role } = useUserRole();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {role === 'event_manager' && <EventManager />}
      {role === 'dj' && <DJ />}
      {role === 'administrator' && <Administrator />}
    </div>
  );
};

export default Dashboard;
