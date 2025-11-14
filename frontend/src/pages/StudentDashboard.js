import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Styles ---
const dashboardStyle = { padding: '40px', fontFamily: '"Segoe UI", Roboto, Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: 'calc(100vh - 70px)' };
const headerStyle = { fontSize: '2.5rem', fontWeight: '600', color: '#2c3e50', marginBottom: '40px' };
const examTableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' };
const thStyle = { backgroundColor: '#f8f9fa', padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#495057' };
const tdStyle = { padding: '15px 20px', borderBottom: '1px solid #eee' };
const buttonStyle = { padding: '8px 15px', fontSize: '0.9rem', fontWeight: '600', border: 'none', borderRadius: '5px', cursor: 'pointer', color: '#fff' };
const activeStyle = { ...buttonStyle, backgroundColor: '#007BFF' };
const completedStyle = { ...buttonStyle, backgroundColor: '#28a745' };
const disabledStyle = { ...buttonStyle, backgroundColor: '#6c757d', cursor: 'not-allowed' };
// --- End Styles ---

function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(null); 

    useEffect(() => {
        if (user) {
            axios.get(`http://127.0.0.1:5000/student/dashboard/${user.id}`)
                .then(res => setExams(res.data))
                .catch(err => console.error("Error fetching dashboard:", err));
        }
    }, [user]);

    const handleAttempt = (examid) => {
        setIsLoading(examid); 
        navigate(`/student/exam/${examid}`);
    };
    
    const handleViewResults = (attemptid) => {
        navigate(`/student/results/${attemptid}`);
    };

    const renderButton = (exam) => {
        const isThisButtonLoading = isLoading === exam.examid;
        switch (exam.status) {
            case 'Active':
                return (<button style={isThisButtonLoading ? disabledStyle : activeStyle} onClick={() => handleAttempt(exam.examid)} disabled={isThisButtonLoading}>{isThisButtonLoading ? 'Loading...' : 'Attempt Now'}</button>);
            case 'Completed':
                return (<button style={completedStyle} onClick={() => handleViewResults(exam.attemptid)}>View Results</button>);
            case 'Upcoming':
                return <button style={disabledStyle} disabled>Upcoming</button>;
            case 'Past':
                return <button style={disabledStyle} disabled>Missed</button>;
            default: return null;
        }
    };

    return (
        <div style={dashboardStyle}>
            <h1 style={headerStyle}>Welcome, {user ? user.name : 'Student'}!</h1>
            <table style={examTableStyle}>
                <thead><tr><th style={thStyle}>Course</th><th style={thStyle}>Exam</th><th style={thStyle}>Start Time</th><th style={thStyle}>End Time</th><th style={thStyle}>Status / Action</th></tr></thead>
                <tbody>
                    {exams.length === 0 && (<tr><td colSpan="5" style={{...tdStyle, textAlign: 'center'}}>No exams.</td></tr>)}
                    {exams.map(exam => (
                        <tr key={exam.examid}>
                            <td style={tdStyle}>{exam.coursetitle}</td>
                            <td style={tdStyle}>{exam.examtitle}</td>
                            {/* --- THIS IS THE TIMEZONE FIX --- */}
                            <td style={tdStyle}>
                                {new Date(exam.starttime).toLocaleString()}
                            </td>
                            <td style={tdStyle}>
                                {new Date(exam.endtime).toLocaleString()}
                            </td>
                            {/* --- END OF FIX --- */}
                            <td style={tdStyle}>{renderButton(exam)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default StudentDashboard;