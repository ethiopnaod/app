import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

interface Settings {
  theme: 'light' | 'dark';
  sound: boolean;
  notifications: boolean;
  language: string;
}

export interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  saveSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'light',
  sound: true,
  notifications: true,
  language: 'en',
};

import { SettingsContext } from './SettingsContextInstance';



export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettingsState] = useState<Settings>(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [lastSavedSettings, setLastSavedSettings] = useState<Settings>(settings);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Save settings to Firestore if logged in, only if changed
  const saveSettings = React.useCallback(async () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    if (user && JSON.stringify(settings) !== JSON.stringify(lastSavedSettings)) {
      try {
        const userRef = doc(db, 'users', user.uid);
        // Use setDoc with merge:true for all updates
        await setDoc(userRef, { settings }, { merge: true });
        setLastSavedSettings(settings);
        setSaveError(null);
        console.log('Settings saved to Firestore:', settings);
      } catch (err) {
        setSaveError('Failed to save settings to Firestore. Please try again later.');
        console.error('Failed to save settings to Firestore:', err);
      }
    }
  }, [settings, user, lastSavedSettings]);

  // Load settings from Firestore on login, cache in context
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().settings) {
            if (isMounted) setSettingsState(userDoc.data().settings);
            // Cache settings in sessionStorage for fast reloads
            sessionStorage.setItem('cachedSettings', JSON.stringify(userDoc.data().settings));
          }
        } catch (e) {
          // Try to load from cache if Firestore fails
          const cached = sessionStorage.getItem('cachedSettings');
          if (cached && isMounted) setSettingsState(JSON.parse(cached));
          console.error('Failed to load settings from Firestore:', e);
        }
      }
    };
    fetchSettings();
    return () => { isMounted = false; };
  }, [user]);

  // Save to localStorage always
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    // Debounce Firestore save
    if (user && JSON.stringify(settings) !== JSON.stringify(lastSavedSettings)) {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        saveSettings();
      }, 1500); // 1.5s debounce
    }
  }, [settings, user, lastSavedSettings, saveSettings]);

  const setSettings = (newSettings: Partial<Settings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      // Only update if changed
      if (JSON.stringify(updated) !== JSON.stringify(prev)) {
        return updated;
      }
      return prev;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, saveSettings }}>
      {children}
      {saveError && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#f87171', color: 'white', padding: 12, borderRadius: 8, zIndex: 9999 }}>
          {saveError}
        </div>
      )}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
