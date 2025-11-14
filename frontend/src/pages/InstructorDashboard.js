import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// --- Styles ---
const dashboardStyle = {
    padding: '40px',
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
    minHeight: 'calc(100vh - 70px)', // Account for header
    backgroundColor: '#f4f7f6'
};
const headerStyle = { fontSize: '2.5rem', fontWeight: '600', color: '#2c3e50', marginBottom: '10px' };
const subHeaderStyle = { fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '50px', fontWeight: '300' };
const navContainerStyle = { display: 'flex', justifyContent: 'flex-start', gap: '30px' };
const cardStyle = {
    width: '240px', height: '200px', padding: '20px', borderRadius: '12px', textDecoration: 'none',
    color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s ease'
};
const card1Style = { ...cardStyle, background: 'linear-gradient(135deg, #007BFF, #0056b3)' };
const card2Style = { ...cardStyle, background: 'linear-gradient(135deg, #28a745, #1e7e34)' };
const card3Style = { ...cardStyle, background: 'linear-gradient(135deg, #dc3545, #a71d2a)' };
const cardIconStyle = { fontSize: '2.5rem', marginBottom: '15px' };
const cardTitleStyle = { fontSize: '1.4rem', fontWeight: '600', lineHeight: '1.3' };
const cardDescriptionStyle = { fontSize: '0.9rem', fontWeight: '300', opacity: '0.9' };
// --- End Styles ---

function InstructorDashboard() {
    const { user } = useAuth();

    const handleMouseOver = (e) => {
        e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    };
    const handleMouseOut = (e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
    };

    return (
        <div style={dashboardStyle}>
            <h1 style={headerStyle}>Welcome, {user ? user.name : 'Instructor'}</h1>
            <p style={subHeaderStyle}></p>
            <div style={navContainerStyle}>
                <Link to="/instructor/questionbank" style={card1Style} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <div>
                        <div style={cardIconStyle}></div>
                        <div style={cardTitleStyle}>Manage Question Bank</div>
                    </div>
                    <div style={cardDescriptionStyle}>Create, view, and manage your master questions.</div>
                </Link>
                <Link to="/instructor/create-exam" style={card2Style} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <div>
                        <div style={cardIconStyle}></div>
                        <div style={cardTitleStyle}>Create New Exam</div>
                    </div>
                    <div style={cardDescriptionStyle}>Build a new exam and add questions from your bank.</div>
                </Link>
                <Link to="/instructor/results" style={card3Style} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <div>
                        <div style={cardIconStyle}></div>
                        <div style={cardTitleStyle}>View Results</div>
                    </div>
                    <div style={cardDescriptionStyle}>See student attempts and scores for your exams.</div>
                </Link>
            </div>
        </div>
    );
}
export default InstructorDashboard;