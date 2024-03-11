import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserRole = async (): Promise<UserRole> => {
  try {
    const sessionResponse = await fetch(`http://localhost:80/api/auth/session`, {
      credentials: 'include',
    });
    const sessionData: SessionData = await sessionResponse.json();
    if (sessionData.status === 'success' && sessionData.data?.user.role) {
      return sessionData.data.user.role;
    }
    return null;
  } catch (error) {
    console.error('An error occurred during user role fetch', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [role, setRole] = useState<UserRole>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
    useEffect(() => {
      const initializeAuth = async () => {
        const userRole = await fetchUserRole();
        if (userRole) {
          setRole(userRole);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      };
  
      initializeAuth();
    }, []);
  
    const login = async (username: string, password: string) => {
      const response = await fetch(`http://localhost:80/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        setIsAuthenticated(true);
        const userRole = await fetchUserRole();
        setRole(userRole);
      } else {
        throw new Error('Login failed');
      }
    };
  
    const logout = () => {
      setIsAuthenticated(false);
    };
  
    return (
      <AuthContext.Provider value={{ role, isAuthenticated, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };