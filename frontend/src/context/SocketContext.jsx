import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        let activeSocket = null;

        if (user) {
            const socketUrl = process.env.REACT_APP_API_URL
                ? process.env.REACT_APP_API_URL.replace('/api', '')
                : 'http://localhost:5002';

            activeSocket = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling'], // Prioritize websocket for stability and single connection
                forceNew: false, // Ensure we try to reuse existing connection
                reconnection: true,
                reconnectionAttempts: 5
            });

            activeSocket.on('connect', () => {
            });

            activeSocket.on('connect_error', (err) => {
                // Only log real errors, suppress transient ones during dev reloads
                if (err.message !== 'xhr poll error') {
                    console.error('Socket connection error:', err);
                }
            });

            setSocket(activeSocket);

            return () => {
                if (activeSocket) {
                    activeSocket.disconnect();
                }
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
