'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from './hooks/use-local-storage';
import { User } from './types';
import { dummyUser, dummyCredentials, demoUsers } from './dummy-data';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateSessionUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser, isLoaded] = useLocalStorage<User | null>('erp_auth_user', null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setIsLoggedIn(!!user);
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  const login = async (username: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 1. Check hardcoded demo users (prioritized and bypassing localStorage as requested)
    const demoUserFound = demoUsers.find(u => u.username === username && u.password === password);

    if (demoUserFound) {
      const { password, ...userWithoutPassword } = demoUserFound;
      setUser(userWithoutPassword as User);
      setIsLoggedIn(true);
      return true;
    }

    // 2. Fallback to localStorage for other users
    const storedUsers = localStorage.getItem('erp_users');
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [dummyUser];

    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateSessionUser = (updatedUser: User) => {
    // We don't want to store the password in the session
    const { password, ...userWithoutPassword } = updatedUser;
    setUser(userWithoutPassword as User);
  };

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    updateSessionUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
