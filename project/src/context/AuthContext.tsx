import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

// API base URL
const API_URL = 'http://127.0.0.1:3000';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('gla_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string) => {
    try {
      console.log('Attempting login with:', { email, role }); // Debug log
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password, role }),
      });

      console.log('Login response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      console.log('Login successful:', userData); // Debug log
      setUser(userData);
      localStorage.setItem('gla_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('gla_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gla_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};