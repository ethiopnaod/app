import { createContext } from 'react';
import type { SettingsContextType } from './SettingsContext';

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);