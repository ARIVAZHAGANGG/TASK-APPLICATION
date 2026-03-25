import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/profile');
                    const decoded = jwtDecode(token);
                    setUser({ ...res.data, role: decoded.role || res.data.role });
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials) => {
        const res = await api.post('/auth/login', credentials);
        localStorage.setItem('token', res.data.token);
        const decoded = jwtDecode(res.data.token);
        setUser({ ...res.data.user, role: decoded.role || res.data.user.role });
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        localStorage.setItem('token', res.data.token);
        const decoded = jwtDecode(res.data.token);
        setUser({ ...res.data.user, role: decoded.role || res.data.user.role });
        return res.data;
    };

    const googleLogin = async (token, rememberMe) => {
        const res = await api.post('/auth/google-login', { token, rememberMe });
        localStorage.setItem('token', res.data.token);
        const decoded = jwtDecode(res.data.token);
        setUser({ ...res.data.user, role: decoded.role || res.data.user.role });
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading, updateUser }}>



            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
