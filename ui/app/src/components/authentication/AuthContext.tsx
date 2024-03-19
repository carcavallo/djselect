import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { loginUser, fetchSession, logoutUser } from "../helpers/apiService";

type UserRole = "event_manager" | "dj" | "administrator" | null;

interface User {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
  last_login: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const initializeAuth = async () => {
    try {
      const sessionData = await fetchSession();
      if (sessionData.status === "success" && sessionData.data?.user.role) {
        setIsAuthenticated(true);
        setRole(sessionData.data.user.role);
        setUser(sessionData.data.user);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await loginUser(username, password);
      await initializeAuth();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setRole(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
