import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserService, UserProfile } from '../services/firebaseService';
import { useAuth } from './AuthContext';

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    setLoading(true);
    try {
      const p = await UserService.getUserProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line
  }, [user]);

  return (
    <UserProfileContext.Provider value={{ profile, loading, refreshProfile, setProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
};
