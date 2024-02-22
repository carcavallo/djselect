import React from 'react';
import Authorization from './Authorization';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <Authorization />
    </div>
  );
};

export default Dashboard;
