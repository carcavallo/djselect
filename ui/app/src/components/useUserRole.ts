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
  const {error, setError, notifyError, notifySuccess} = useNotifier();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const sessionResponse = await fetch('http://localhost:80/api/users/session', {
          credentials: 'include',
        });

        const sessionData = await sessionResponse.json() as SessionData;
        if (sessionData.status === 'error') {
          setError('Your session has ended due to inactivity.');
          return;
        }

        const userDetailsResponse = await fetch(`http://localhost:80/api/users/${sessionData.data?.user_id}`, {
          credentials: 'include',
        });

        const userDetailsData = await userDetailsResponse.json() as SessionData;
        if (userDetailsData.status === 'error') {
          setError(userDetailsData.message || 'Failed to fetch user details');
          return;
        }

        setRole(userDetailsData.data?.role || null);
      } catch (error: any) {
        setError(error.message || 'An error occurred during user role fetch');
      }
    };

    fetchUserRole();
  }, [navigate, notifyError, notifyError, setError]);

  return { role, error, notifyError, notifySuccess };
};
