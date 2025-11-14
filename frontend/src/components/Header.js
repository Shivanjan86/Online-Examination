import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const headerStyle = {
    padding: '15px 40px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#007BFF'
};

const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    color: '#333'
};

const logoutButtonStyle = {
    padding: '8px 15px',
    fontSize: '0.9rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#dc3545',
    color: '#fff'
};

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirect to login page
    };

    if (!user) {
        return null; // Don't show header if not logged in
    }

    return (
        <div style={headerStyle}>
            <div style={logoStyle}>Online Examination</div>
            <div style={userInfoStyle}>
                <span>Hello <strong>{user.name}</strong> ({user.role})</span>
                <button style={logoutButtonStyle} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Header;