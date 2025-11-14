import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

// --- Styles ---
const pageStyle = { padding: '40px', fontFamily: '"Segoe UI", Roboto, Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: 'calc(100vh - 70px)' };
const headerStyle = { fontSize: '2.5rem', fontWeight: '600', color: '#2c3e50', marginBottom: '10px' };
const summaryBoxStyle = { padding: '25px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '30px' };
const scoreStyle = { fontSize: '3rem', fontWeight: 'bold', color: '#007BFF' };
const reviewBoxStyle = { padding: '20px 30px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const questionItemStyle = { padding: '20px 0', borderBottom: '1px solid #eee' };
const qTextStyle = { fontSize: '1.2rem', fontWeight: '500', color: '#333', marginBottom: '15px' };
const answerStyle = { fontSize: '1rem', padding: '10px', borderRadius: '5px', marginBottom: '5px' };
const correctStyle = { ...answerStyle, backgroundColor: '#d4edda', color: '#155724' };
const incorrectStyle = { ...answerStyle, backgroundColor: '#f8d7da', color: '#721c24' };
// --- End Styles ---

function StudentResult() {
    const { attemptid } = useParams();
    const [summary, setSummary] = useState(null);
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/student/attempt/${attemptid}/results`)
            .then(res => {
                setSummary(res.data.summary);
                setDetails(res.data.details);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [attemptid]);

    if (loading) return <div style={pageStyle}><h2>Loading Results...</h2></div>;
    if (!summary) return <div style={pageStyle}><h2>Results not found.</h2></div>;

    return (
        <div style={pageStyle}>
            <Link to="/student/dashboard" style={{marginBottom: '20px', display: 'inline-block'}}>&larr; Back to Dashboard</Link>
            <div style={summaryBoxStyle}>
                <h1 style={headerStyle}>{summary.examtitle}</h1>
                <p style={{fontSize: '1.5rem', color: '#555'}}>Your Final Score:</p>
                <div style={scoreStyle}>{summary.score} / {summary.totalmarks}</div>
            </div>
            <div style={reviewBoxStyle}>
                <h2 style={{color: '#333'}}>Question Review</h2>
                {details.map((item, index) => (
                    <div style={questionItemStyle} key={index}>
                        <div style={qTextStyle}>{index + 1}. {item.questiontext}</div>
                        {item.iscorrect ? (
                            <div style={correctStyle}><strong>Your Answer:</strong> {item.selectedanswer} (Correct)</div>
                        ) : (
                            <>
                                <div style={incorrectStyle}><strong>Your Answer:</strong> {item.selectedanswer}</div>
                                <div style={correctStyle}><strong>Correct Answer:</strong> {item.correctanswer}</div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
export default StudentResult;