import React, { useState, useEffect } from 'react';
import api, { clearCsrfToken } from '../services/api';
import { AuthContext } from './AuthContext';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                // If cookies are valid, this succeeds and we're logged in
                // The response interceptor in api.js auto-captures the csrfToken
                const res = await api.get('/auth/me');
                if (res.data.success && res.data.data) {
                    setUser(res.data.data);
                } else {
                    setUser(null);
                }
            } catch {
                // No valid session — user is not logged in
                setUser(null);
            }
            setLoading(false);
        };

        checkUser();
    }, []);

    const login = (userData) => {
        // Cookies are already set by the backend — just update React state
        // CSRF token is auto-captured by the response interceptor in api.js
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout API call failed', error);
        }
        clearCsrfToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

