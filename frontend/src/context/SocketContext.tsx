import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let activeSocket: Socket | null = null;

    if (isAuthenticated && token) {
      // Connect to root location which will be proxied by Vite, or absolute address
      // For local testing, connect directly to backend URL
      const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';
      
      activeSocket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      activeSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket client connected to CodeForge sync backend!');
      });

      activeSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(activeSocket);
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }

    return () => {
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
