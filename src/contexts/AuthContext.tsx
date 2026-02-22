import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Client } from '@/types';
import { getClientById, getClientByFullNameAndCode } from '@/data/mockData';

const TRAINER_USERNAME = 'Mbella';
const TRAINER_PASSWORD = 'Ethan45';
const TRAINER_ID = 't1';
const AUTH_STORAGE_KEY = 'malibu_bodies_auth';
const THEME_STORAGE_KEYS = ['malibu-theme', 'malibu-dark', 'malibu-card-style'];

export type AuthState =
  | { status: 'unauthenticated' }
  | { status: 'trainer'; userId: string }
  | { status: 'client'; clientId: string };

function loadStoredAuth(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return { status: 'unauthenticated' };
    const parsed = JSON.parse(stored);
    if (parsed.status === 'trainer' && parsed.userId) return { status: 'trainer', userId: parsed.userId };
    if (parsed.status === 'client' && parsed.clientId) return { status: 'client', clientId: parsed.clientId };
  } catch {
    // ignore
  }
  return { status: 'unauthenticated' };
}

function saveAuth(state: AuthState) {
  try {
    if (state.status === 'unauthenticated') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore
  }
}

interface AuthContextType {
  auth: AuthState;
  loginAsTrainer: (username: string, password: string) => boolean;
  loginAsClient: (fullName: string, accessCode: string) => boolean;
  logout: () => void;
  getClient: () => Client | undefined;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadStoredAuth);

  const loginAsTrainer = useCallback((username: string, password: string): boolean => {
    if (username === TRAINER_USERNAME && password === TRAINER_PASSWORD) {
      const state: AuthState = { status: 'trainer', userId: TRAINER_ID };
      setAuth(state);
      saveAuth(state);
      return true;
    }
    return false;
  }, []);

  const loginAsClient = useCallback((fullName: string, accessCode: string): boolean => {
    const client = getClientByFullNameAndCode(fullName.trim(), accessCode.trim());
    if (client) {
      const state: AuthState = { status: 'client', clientId: client.id };
      setAuth(state);
      saveAuth(state);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuth({ status: 'unauthenticated' });
    saveAuth({ status: 'unauthenticated' });
    THEME_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }, []);

  const getClient = useCallback((): Client | undefined => {
    if (auth.status === 'client') {
      return getClientById(auth.clientId);
    }
    return undefined;
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, loginAsTrainer, loginAsClient, logout, getClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
