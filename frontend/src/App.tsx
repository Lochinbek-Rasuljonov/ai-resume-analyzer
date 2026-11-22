import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/AuthContext';
import { useAuth, useLang } from './store/hooks';
import { ThemeProvider } from './store/ThemeContext';
import { LangProvider } from './store/LangContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import AnalysisDetail from './pages/AnalysisDetail';
import Profile from './pages/Profile';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });

const Spinner: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100svh', gap: 16, background: 'var(--bg)' }}>
    <div style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const ErrorScreen: React.FC<{ message: string }> = ({ message }) => {
  const { t } = useLang();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100svh', padding: 24, background: 'var(--bg)', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>{t('notFound')}</div>
      <p style={{ fontSize: 14, color: 'var(--fg3)', lineHeight: 1.6 }}>{message}</p>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, error } = useAuth();
  if (isLoading) return <Spinner />;
  if (error || !user) return <ErrorScreen message={error || 'Telegram orqali kiring.'} />;
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="upload" element={<Upload />} />
                  <Route path="analysis/:id" element={<AnalysisDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

export default App;
