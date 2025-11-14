import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// --- Styles ---
const pageStyle = { padding: '40px', fontFamily: '"Segoe UI", Roboto, Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: 'calc(100vh - 70px)' };
const headerStyle = { fontSize: '2.5rem', fontWeight: '600', color: '#2c3e50', marginBottom: '40px' };
const backLinkStyle = { display: 'inline-block', marginBottom: '20px', color: '#007BFF', textDecoration: 'none', fontWeight: '500' };
const twoColumnStyle = { display: 'flex', gap: '30px', alignItems: 'flex-start' };
const listStyle = { flex: 1, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' };
const tableStyle = { flex: 2 };
const examItemStyle = { padding: '15px 20px', borderBottom: '1px solid #eee', cursor: 'pointer' };
const reportTableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const thStyle = { backgroundColor: '#f8f9fa', padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' };
const tdStyle = { padding: '12px 15px', borderBottom: '1px solid #eee' };
// --- End Styles ---

function InstructorResults() {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (user) {
            axios.get(`http://127.0.0.1:5000/instructor/${user.id}/exams`)
                .then(res => setExams(res.data))
                .catch(err => console.error(err));
        }
    }, [user]);

    const handleExamSelect = (exam) => {
        setSelectedExam(exam);
        axios.get(`http://127.0.0.1:5000/instructor/exam/${exam.id}/results`)
            .then(res => setResults(res.data))
            .catch(err => console.error(err));
    };

    return (
        <div style={pageStyle}>
            <Link to="/instructor/dashboard" style={backLinkStyle}>&larr; Back to Dashboard</Link>
            <h1 style={headerStyle}>View Results</h1>
            <div style={twoColumnStyle}>
                <div style={listStyle}>
                    <div style={{...thStyle, fontSize: '1.2rem'}}>Select an Exam</div>
                    <div style={{maxHeight: '600px', overflowY: 'auto'}}>
                        {exams.length === 0 && <div style={{padding: '15px 20px'}}>No exams found.</div>}
                        {exams.map(exam => (
                            <div key={exam.id} style={{ ...examItemStyle, backgroundColor: selectedExam?.id === exam.id ? '#e6f7ff' : '#fff' }} onClick={() => handleExamSelect(exam)}>
                                <div style={{fontWeight: '600'}}>{exam.title}</div>
                                {/* --- THIS IS THE TIMEZONE FIX --- */}
                                <div style={{fontSize: '0.9rem', color: '#555'}}>
                                    {new Date(exam.starttime).toLocaleString()}
                                </div>
                                {/* --- END OF FIX --- */}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={tableStyle}>
                    {selectedExam ? (
                        <>
                            <h2 style={{color: '#333'}}>Results for: {selectedExam.title}</h2>
                            <table style={reportTableStyle}>
                                <thead><tr><th style={thStyle}>Student Name</th><th style={thStyle}>Score</th><th style={thStyle}>Attempt Time</th></tr></thead>
                                <tbody>
                                    {results.length === 0 && (<tr><td colSpan="4" style={{...tdStyle, textAlign: 'center'}}>No attempts found.</td></tr>)}
                                    {results.map(res => (
                                        <tr key={res.attemptid}>
                                            <td style={tdStyle}>{res.studentname}</td>
                                            <td style={tdStyle}><strong>{res.score} / {res.totalmarks}</strong></td>
                                            
                                            {/* --- THIS IS THE TIMEZONE FIX --- */}
                                            <td style={tdStyle}>
                                                {new Date(res.attempttime).toLocaleString()}
                                            </td>
                                            {/* --- END OF FIX --- */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : ( <div style={{...reportTableStyle, padding: '40px', textAlign: 'center', color: '#777'}}>Please select an exam to view results.</div> )}
                </div>
            </div>
        </div>
    );
}
export default InstructorResults;