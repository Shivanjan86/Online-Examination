import React, { createContext, useState, useContext } from 'react';

// A unique key for this project
const LOCAL_STORAGE_KEY = 'webclassUser';

// Create the context
const AuthContext = createContext(null);

// Create a "provider" component
export const AuthProvider = ({ children }) => {
    
    // Try to get our specific user from localStorage
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            return null;
        }
    });

    // This function saves data from OUR login endpoint
    const login = (userData) => {
        // 'userData' is what our login API returns: {id, name, role}
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        // Remove our specific key
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a simple "hook" to use this context easily
export const useAuth = () => {
    return useContext(AuthContext);
};