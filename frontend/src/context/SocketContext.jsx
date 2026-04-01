import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

import { SOCKET_URL } from '../utils/config';

const SocketContext = createContext();
const OnlineContext = createContext();

export const useSocket = () => useContext(SocketContext);
export const useOnlineUsers = () => useContext(OnlineContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        let activeSocket = null;

        if (user) {
            const socketUrl = SOCKET_URL || 'http://localhost:5002';

            activeSocket = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling'], // Prioritize websocket for stability and single connection
                forceNew: false, // Ensure we try to reuse existing connection
                reconnection: true,
                reconnectionAttempts: 5,
                query: { userId: user.id || user._id }
            });

            activeSocket.on('connect', () => {
            });

            activeSocket.on('online_users', (users) => {
                setOnlineUsers(users);
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
            <OnlineContext.Provider value={onlineUsers}>
                {children}
            </OnlineContext.Provider>
        </SocketContext.Provider>
    );
};
