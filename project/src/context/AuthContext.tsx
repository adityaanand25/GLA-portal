import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

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
    // Check for stored user data on component mount
    const storedUser = localStorage.getItem('gla_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string) => {
    // Simulate API call with local storage for demo
    try {
      // In a real app, this would be an API call
      // Mock successful login with hardcoded user data
      const userData: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: email.split('@')[0],
        email,
        role, // 'student', 'faculty', or 'admin'
      };
      
      setUser(userData);
      localStorage.setItem('gla_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid credentials');
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    // Simulate API call with local storage for demo
    try {
      // In a real app, this would be an API call
      const userData: User = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        role,
      };
      
      setUser(userData);
      localStorage.setItem('gla_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed');
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