import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type UserRole = "event_manager" | "dj" | "administrator" | null;

interface User {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
  last_login: number;
  created_at: string;
}

interface SessionData {
  status: "error" | "success";
  message?: string;
  data?: {
    expires: number;
    user: User;
  };
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
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/auth/session`,
      {
        credentials: "include",
      }
    );
    const sessionData: SessionData = await response.json();
    if (sessionData.status === "success" && sessionData.data?.user.role) {
      setIsAuthenticated(true);
      setRole(sessionData.data.user.role);
      setUser(sessionData.data.user);
    } else {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      }
    );
    if (response.ok) {
      // Re-initialize to fetch user info upon successful login
      initializeAuth();
    } else {
      throw new Error("Login failed");
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setIsAuthenticated(false);
        setRole(null);
        setUser(null); // Clear user information upon logout
      } else {
        console.error("Logout failed");
      }
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
