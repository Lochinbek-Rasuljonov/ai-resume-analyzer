import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const WebApp = (window as any).Telegram?.WebApp;

interface User {
    id: number;
    telegram_id: number;
    first_name: string;
    last_name: string;
    username: string;
    photo_url: string;
    is_premium: boolean;
    credits: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const authenticate = async () => {
        try {
            setIsLoading(true);
            if (WebApp) {
                WebApp.ready();
                WebApp.expand();
            }
            
            // For local development without Telegram wrapper
            let initData = WebApp?.initData;
            
            if (!initData) {
                // Mock init data for local testing outside Telegram
                initData = "query_id=mock_id&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1719234567&hash=mock_hash";
            }

            if (!initData) {
                throw new Error("No Telegram init data found");
            }

            const response = await api.post('users/auth/telegram/', { initData });
            const { access, refresh, user: userData } = response.data;
            
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            setUser(userData);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || "Failed to authenticate");
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('users/me/');
            setUser(response.data);
        } catch (err) {
            console.error("Failed to refresh user", err);
        }
    };

    useEffect(() => {
        authenticate();
    }, []);

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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
