import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  fullName: string;
  phone: string;
  cccd: string;
}

interface AuthContextType {
  user: User | null;
  login: (fullName: string, phone: string, cccd: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aura_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (fullName: string, phone: string, cccd: string) => {
    const newUser = { fullName, phone, cccd };
    setUser(newUser);
    localStorage.setItem('aura_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aura_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
