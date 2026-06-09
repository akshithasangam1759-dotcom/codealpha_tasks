import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: number[];
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = io('/', {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      socket.on('users:online', (users: number[]) => setOnlineUsers(users));
      socket.on('user:online', ({ user_id }: { user_id: number }) => {
        setOnlineUsers(prev => [...new Set([...prev, user_id])]);
      });
      socket.on('user:offline', ({ user_id }: { user_id: number }) => {
        setOnlineUsers(prev => prev.filter(id => id !== user_id));
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
