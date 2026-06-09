import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './components/layout/MainLayout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import BoardPage from './pages/BoardPage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ChatPage from './pages/ChatPage';
import CallsPage from './pages/CallsPage';
import WhiteboardPage from './pages/WhiteboardPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<BoardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="calls" element={<CallsPage />} />
        <Route path="projects/:projectId/whiteboard" element={<WhiteboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
                error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
              }}
            />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
