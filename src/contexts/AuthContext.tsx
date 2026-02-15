/**
 * 认证上下文（CloudBase 版本）
 * 管理用户认证状态和用户信息
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { getUserProfile } from '../services/auth';
import { UserProfile } from '../types';

interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshUserProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  useEffect(() => {
    // 监听登录状态变化
    const unsubscribe = auth.onLoginStateChanged(async (loginState) => {
      if (loginState) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.nickName,
          });

          try {
            const profile = await getUserProfile(currentUser.uid);
            setUserProfile(profile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
