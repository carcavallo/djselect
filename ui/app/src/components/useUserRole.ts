import { useState, useEffect } from 'react';
import { useNotifier } from './useNotifier';

type UserRole = 'event_manager' | 'dj' | 'administrator' | null;

interface SessionData {
  status: 'error' | 'success';
  message?: string;
  data?: {
    expires: number;
    user: {
      user_id: string;
      username: string;
      email: string;
      role: UserRole;
      last_login: number;
      created_at: string;
    };
  };
}

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const { notifyError } = useNotifier();
  
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const sessionResponse = await fetch('http://localhost:80/api/auth/session', {
          credentials: 'include',
        });
        const sessionData: SessionData = await sessionResponse.json();
        if (sessionData.status === 'success' && sessionData.data?.user.role) {
          setRole(sessionData.data.user.role);
        }
      } catch (error: any) {
        notifyError(error.message || 'An error occurred during user role fetch');
      }
    };

    fetchUserRole();
  }, [notifyError]);

  return { role };
};