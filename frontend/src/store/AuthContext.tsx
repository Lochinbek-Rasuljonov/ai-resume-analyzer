import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import { tg } from '../telegram';
import { AuthContext, type User } from './contexts';

// Inside Telegram the app gets signed initData. For local development outside Telegram,
// `python manage.py dev_init_data` prints a signed value to put in VITE_DEV_INIT_DATA.
const initData = tg?.initData || (import.meta.env.DEV ? import.meta.env.VITE_DEV_INIT_DATA : '') || '';

const NOT_IN_TELEGRAM = 'Open this app from the Telegram bot.';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(initData));
  const [error, setError] = useState<string | null>(initData ? null : NOT_IN_TELEGRAM);

  useEffect(() => {
    if (!initData) return;
    tg?.ready();
    tg?.expand();
    api
      .post('users/auth/telegram/', { initData })
      .then(({ data }) => {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setUser(data.user);
      })
      .catch((err: unknown) => {
        const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
        setError(message || (err instanceof Error ? err.message : 'Failed to authenticate'));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const refreshUser = async () => {
    try {
      const response = await api.get<User>('users/me/');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
