import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifier } from './useNotifier';
import 'react-toastify/dist/ReactToastify.css';

type UserRole = 'event_manager' | 'dj' | 'administrator' | null;

interface SessionData {
  status: 'error' | 'success';
  message?: string;
  data?: {
    user_id: string;
    role?: UserRole;
  }; 
}

export const useUserRole = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(null);
  const {error, notifyError} = useNotifier();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const sessionResponse = await fetch('http://localhost:80/api/users/session', {
          credentials: 'include',
        });

        if (!sessionResponse.ok) {
          navigate('/');
        }

        const sessionData = await sessionResponse.json() as SessionData;
        if (sessionData.status === 'error') {
          notifyError(sessionData.message || 'Session error');
          setTimeout(() => {
            navigate('/');
          }, 2000);
          return;
        }

        if (!sessionData.data?.user_id) {
          notifyError('Session expired');
          setTimeout(() => {
            navigate('/');
          }, 2000);
          return;
        }

        const userDetailsResponse = await fetch(`http://localhost:80/api/users/${sessionData.data?.user_id}`, {
          credentials: 'include',
        });

        if (!userDetailsResponse.ok) {
          throw new Error('User details response not OK');
        }

        const userDetailsData = await userDetailsResponse.json() as SessionData;
        if (userDetailsData.status === 'error') {
          notifyError(userDetailsData.message || 'Failed to fetch user details');
          return;
        }

        setRole(userDetailsData.data?.role || null);
      } catch (error: any) {
        notifyError(error.message || 'An error occurred during user role fetch');
      }
    };

    fetchUserRole();
  }, [navigate, notifyError]);

  return { role, error };
};
