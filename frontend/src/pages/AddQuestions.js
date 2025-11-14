import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// --- Styles ---
const pageStyle = { padding: '40px', fontFamily: '"Segoe UI", Roboto, Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: 'calc(100vh - 70px)' };
const headerStyle = { fontSize: '2.5rem', fontWeight: '600', color: '#2c3e50', marginBottom: '40px' };
const formStyle = { maxWidth: '800px', padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const inputGroupStyle = { marginBottom: '25px' };
const labelStyle = { display: 'block', fontSize: '1.1rem', fontWeight: '500', color: '#333', marginBottom: '10px' };
const textInputStyle = { width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' };
const optionContainerStyle = { display: 'flex', alignItems: 'center', marginBottom: '10px' };
const radioStyle = { marginRight: '10px', transform: 'scale(1.2)' };
const optionInputStyle = { flex: '1', padding: '10px', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '8px' };
const buttonStyle = { padding: '12px 25px', fontSize: '1.1rem', fontWeight: '600', color: '#fff', backgroundColor: '#007BFF', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.3s ease' };
const backLinkStyle = { display: 'inline-block', marginBottom: '20px', color: '#007BFF', textDecoration: 'none', fontWeight: '500' };
const messageStyle = { padding: '10px', borderRadius: '5px', marginTop: '20px', fontSize: '1rem' };
const successStyle = { ...messageStyle, backgroundColor: '#d4edda', color: '#155724' };
const errorStyle = { ...messageStyle, backgroundColor: '#f8d7da', color: '#721c24' };
// --- End Styles ---

function AddQuestions() {
    const { user } = useAuth();
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctOption, setCorrectOption] = useState(0);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null); setError(null);
        if (!user) { setError("Login session expired. Please log in again."); return; }

        try {
            await axios.post('http://127.0.0.1:5000/instructor/questionbank', {
                questiontext: questionText,
                options: options,
                correctOptionIndex: correctOption,
                instructorid: user.id
            });
            setMessage('Question added successfully!');
            setQuestionText(''); setOptions(['', '', '', '']); setCorrectOption(0);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        }
    };

    return (
        <div style={pageStyle}>
            <Link to="/instructor/dashboard" style={backLinkStyle}>&larr; Back to Dashboard</Link>
            <h1 style={headerStyle}>Manage Question Bank</h1>
            <form style={formStyle} onSubmit={handleSubmit}>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Question Text</label>
                    <textarea style={{ ...textInputStyle, minHeight: '100px' }} value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Options (Select the correct answer)</label>
                    {options.map((option, index) => (
                        <div style={optionContainerStyle} key={index}>
                            <input type="radio" name="correctOption" checked={correctOption === index} onChange={() => setCorrectOption(index)} style={radioStyle} />
                            <input type="text" style={optionInputStyle} placeholder={`Option ${index + 1}`} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} required />
                        </div>
                    ))}
                </div>
                <button type="submit" style={buttonStyle} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007BFF'}>
                    Add Question to Bank
                </button>
                {message && <div style={successStyle}>{message}</div>}
                {error && <div style={errorStyle}>{error}</div>}
            </form>
        </div>
    );
}
export default AddQuestions;