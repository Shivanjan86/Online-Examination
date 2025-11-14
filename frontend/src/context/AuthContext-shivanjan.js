import React, { createContext, useState, useContext } from 'react';

const LOCAL_STORAGE_KEY = 'webclassUser';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            return null;
        }
    });

    const login = (userData) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};