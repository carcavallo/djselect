import React, { useState, useEffect } from 'react';
import EventManager from './roles/EventManager';
import DJ from './roles/DJ';
import Administrator from './roles/Administrator';

type UserRole = 'event_manager' | 'dj' | 'administrator' | null;

interface SessionData {
  data: {
    user_id: string;
    role: UserRole;
  };
}

const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const sessionResponse = await fetch('http://localhost:80/api/users/session', {
          credentials: 'include',
        });
        if (!sessionResponse.ok) throw new Error('Session not found');

        const sessionData: SessionData = await sessionResponse.json();
        const userId = sessionData.data?.user_id;

        if (!userId) throw new Error('User ID not found in session');

        const userDetailsResponse = await fetch(`http://localhost:80/api/users/${userId}`, {
          credentials: 'include',
        });
        if (!userDetailsResponse.ok) throw new Error('User details not found');

        const userDetailsData: SessionData = await userDetailsResponse.json();
        setRole(userDetailsData.data?.role);
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch user details');
      }
    };

    fetchUserRole();
  }, []);

  return { role, errorMessage };
};

const Authorization: React.FC = () => {
  const { role, errorMessage } = useUserRole();

  if (errorMessage) {
    return <div>Error: {errorMessage}</div>;
  }

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

export default Authorization;
