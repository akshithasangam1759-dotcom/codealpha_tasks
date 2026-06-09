import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import type { Notification } from '../../types';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [workspaces, setWorkspaces] = useState([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [petsEnabled, setPetsEnabled] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/workspaces').then(r => setWorkspaces(r.data.data || [])).catch(() => {});
      api.get('/notifications').then(r => setNotifications(r.data.data || [])).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket) {
      socket.on('notification:new', (notif: Notification) => {
        setNotifications(prev => [notif, ...prev]);
        toast(notif.message, { icon: '🔔' });
      });
      return () => { socket.off('notification:new'); };
    }
  }, [socket]);

  const handleMarkRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🤖</div>
          <div className="text-lg font-semibold gradient-text">Loading WorkNest...</div>
          <div className="mt-3 w-48 h-1 rounded-full overflow-hidden mx-auto" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="h-full rounded-full animate-pulse" style={{ background: 'linear-gradient(90deg, #7c3aed, #ec4899)', width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)', transition: 'background 0.3s ease' }}>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-40 lg:static lg:flex transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar workspaces={workspaces} onCreateWorkspace={() => { navigate('/workspaces/new'); setMobileSidebarOpen(false); }} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Navbar
          title={pageTitle}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onCreateProject={() => navigate('/projects/new')}
          petsEnabled={petsEnabled}
          onTogglePets={() => setPetsEnabled(p => !p)}
          onMenuToggle={() => setMobileSidebarOpen(o => !o)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet context={{ setPageTitle }} />
        </main>
      </div>
    </div>
  );
}