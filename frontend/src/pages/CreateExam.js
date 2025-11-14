import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// --- Styles (Same as before) ---
const pageStyle = { padding: '40px', fontFamily: '"Segoe UI", Roboto, Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: 'calc(100vh - 70px)' };
const headerStyle = { fontSize: '2.5rem', fontWeight: '600', color: '#2c3e50', marginBottom: '40px' };
const backLinkStyle = { display: 'inline-block', marginBottom: '20px', color: '#007BFF', textDecoration: 'none', fontWeight: '500' };
const twoColumnStyle = { display: 'flex', gap: '40px' };
const formStyle = { flex: '1', maxWidth: '500px', padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', alignSelf: 'flex-start' };
const questionListStyle = { flex: '2', padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const inputGroupStyle = { marginBottom: '25px' };
const labelStyle = { display: 'block', fontSize: '1.1rem', fontWeight: '500', color: '#333', marginBottom: '10px' };
const inputStyle = { width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' };
const buttonStyle = { padding: '12px 25px', fontSize: '1.1rem', fontWeight: '600', color: '#fff', backgroundColor: '#28a745', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.3s ease' };
const questionItemStyle = { display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee', gap: '15px' };
const questionTextStyle = { flex: '1', fontSize: '1rem', color: '#333' };
const marksInputStyle = { width: '80px', padding: '8px', border: '1px solid #ccc', borderRadius: '5px' };
// --- End Styles ---

function CreateExam() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Form Details
    const [title, setTitle] = useState('');
    // --- NEW: We now store a single course (object), not an array
    const [myCourse, setMyCourse] = useState(null); 
    const [starttime, setStarttime] = useState('');
    const [endtime, setEndtime] = useState('');

    // Data from API
    const [questionBank, setQuestionBank] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState({});

    // Fetch single course and question bank on page load
    useEffect(() => {
        if (!user) return;

        
        axios.get(`http://127.0.0.1:5000/instructor/courses/${user.id}`)
            .then(res => {
                setMyCourse(res.data); // Save the single course object
            })
            .catch(err => console.error(err));

      
        axios.get(`http://127.0.0.1:5000/instructor/questionbank/${user.id}`)
            .then(res => setQuestionBank(res.data))
            .catch(err => console.error(err));

    }, [user]);

    // Handle checkbox change (unchanged)
    const handleSelectQuestion = (q_id) => {
        setSelectedQuestions(prev => ({
            ...prev,
            [q_id]: { ...prev[q_id], selected: !prev[q_id]?.selected, marks: prev[q_id]?.marks || 5 }
        }));
    };

    // Handle marks change (unchanged)
    const handleMarksChange = (q_id, marks) => {
        setSelectedQuestions(prev => ({ ...prev, [q_id]: { ...prev[q_id], marks: parseInt(marks, 10) || 0 } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- NEW: Check if the instructor has a course
        if (!myCourse || !myCourse.id) {
            alert('You are not assigned to a course. Please contact an admin.');
            return;
        }

        const questionsForExam = Object.entries(selectedQuestions)
            .filter(([id, data]) => data.selected)
            .map(([id, data]) => ({ questionid: parseInt(id, 10), marks: data.marks }));

        if (questionsForExam.length === 0) {
            alert('Please select at least one question for the exam.');
            return;
        }

        try {
            await axios.post('http://127.0.0.1:5000/instructor/exams', {
                courseid: myCourse.id, // --- NEW: Use the ID from the state
                title,
                starttime,
                endtime,
                questions: questionsForExam
            });
            
            alert('Exam created successfully!');
            navigate('/instructor/dashboard');

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create exam.');
        }
    };

    return (
        <div style={pageStyle}>
            <Link to="/instructor/dashboard" style={backLinkStyle}>&larr; Back to Dashboard</Link>
            <h1 style={headerStyle}>Create New Exam</h1>

            <div style={twoColumnStyle}>
                
                {/* --- Left Column: Exam Details Form --- */}
                <form style={formStyle} onSubmit={handleSubmit}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Exam Title</label>
                        <input
                            type="text"
                            style={inputStyle}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    
                    {/* --- NEW: Replaced the dropdown menu --- */}
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Course</label>
                        <div style={{...inputStyle, backgroundColor: '#f4f7f6', color: '#333'}}>
                            {myCourse ? myCourse.title : 'Loading your course...'}
                        </div>
                    </div>
                    
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Start Time</label>
                        <input
                            type="datetime-local"
                            style={inputStyle}
                            value={starttime}
                            onChange={(e) => setStarttime(e.target.value)}
                            required
                        />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>End Time</label>
                        <input
                            type="datetime-local"
                            style={inputStyle}
                            value={endtime}
                            onChange={(e) => setEndtime(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={buttonStyle}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                    >
                        Create Exam
                    </button>
                </form>

                {/* --- Right Column: Question Bank (Unchanged) --- */}
                <div style={questionListStyle}>
                    <h2 style={{...labelStyle, fontSize: '1.5rem'}}>Select Questions</h2>
                    <div style={{maxHeight: '600px', overflowY: 'auto'}}>
                        {questionBank.length === 0 && <p>Your question bank is empty.</p>}
                        
                        {questionBank.map(q => (
                            <div style={questionItemStyle} key={q.id}>
                                <input
                                    type="checkbox"
                                    style={{transform: 'scale(1.3)'}}
                                    checked={selectedQuestions[q.id]?.selected || false}
                                    onChange={() => handleSelectQuestion(q.id)}
                                />
                                <div style={questionTextStyle}>{q.questiontext}</div>
                                <input
                                    type="number"
                                    placeholder="Marks"
                                    style={marksInputStyle}
                                    value={selectedQuestions[q.id]?.marks || ''}
                                    onChange={(e) => handleMarksChange(q.id, e.target.value)}
                                    disabled={!selectedQuestions[q.id]?.selected} 
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CreateExam;