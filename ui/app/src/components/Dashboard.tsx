import React from 'react';
import EventManager from './roles/EventManager';
import DJ from './roles/DJ';
import Admin from './roles/Admin';

const useUserRole = () => {
  const role = 'event_manager';
  return role;
};

const Dashboard: React.FC = () => {
  const role = useUserRole();

  const renderViewForRole = (role: string) => {
    switch (role) {
      case 'event_manager':
        return <EventManager />;
      case 'dj':
        return <DJ />;
      case 'admin':
        return <Admin />;
    }
  };

  return (
    <>
      <div className="dashboard-container">
        {renderViewForRole(role)}
      </div>
    </>

  );
};

export default Dashboard;
