import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';

// --- Styles ---
const pageStyle = { padding: '40px', fontFamily: '"Segoe UI", Roboto, Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: 'calc(100vh - 70px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' };
const examBoxStyle = { width: '100%', maxWidth: '900px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' };
const headerStyle = { padding: '20px 30px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const questionBodyStyle = { padding: '30px 40px' };
const qTextStyle = { fontSize: '1.5rem', fontWeight: '500', color: '#333', marginBottom: '30px' };
const optionStyle = { display: 'block', padding: '15px 20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '15px', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s ease' };
const navStyle = { padding: '20px 40px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const navButtonStyle = { padding: '10px 20px', fontSize: '1rem', fontWeight: '600', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#007BFF', color: '#fff' };
const finishButtonStyle = { ...navButtonStyle, backgroundColor: '#28a745' };
const timerStyle = { fontSize: '1.2rem', fontWeight: '600', color: '#dc3545' };
// --- End Styles ---

function TakeExam() {
    const { user } = useAuth();
    const { examid } = useParams();
    const navigate = useNavigate();

    const [examTitle, setExamTitle] = useState('');
    const [endTime, setEndTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timerIdRef = useRef(null); 

    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleFinish = useCallback(async (isAutoSubmit = false) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        clearInterval(timerIdRef.current);

        if (!isAutoSubmit) {
            if (!window.confirm("Are you sure you want to finish the exam?")) {
                setIsSubmitting(false);
                return;
            }
        }

        try {
            await axios.post(`http://127.0.0.1:5000/student/attempt/${attemptId}/finish`);
            
            if (isAutoSubmit) {
                alert("Time is up! Your exam has been submitted automatically.");
            } else {
                alert(`Exam submitted successfully!`);
            }
            
            navigate('/student/dashboard');

        } catch (err) {
            console.error("Failed to finish exam:", err);
            alert("An error occurred while submitting your exam.");
            setIsSubmitting(false);
        }
    }, [attemptId, isSubmitting, navigate]); 

    // 1. On page load
    useEffect(() => {
        if (!user) return;
        axios.post(`http://127.0.0.1:5000/student/exams/${examid}/start`, { studentid: user.id })
            .then(res => {
                const newAttemptId = res.data.attemptid;
                setAttemptId(newAttemptId);
                return axios.get(`http://127.0.0.1:5000/student/attempt/${newAttemptId}/questions`);
            })
            .then(res => {
                setQuestions(res.data.questions);
                setExamTitle(res.data.examDetails.examtitle);
                
                // --- THIS IS THE TIMEZONE FIX ---
                setEndTime(res.data.examDetails.endtime);
                // --- END OF FIX ---
                
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.message || "Failed to start exam.");
                setIsLoading(false);
            });
    }, [user, examid]);
    
    // 2. This useEffect hook manages the countdown timer
    useEffect(() => {
        if (!endTime) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime(); 
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft("00:00");
                clearInterval(timerIdRef.current);
                handleFinish(true); // Force submit
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        };

        updateTimer();
        timerIdRef.current = setInterval(updateTimer, 1000);

        return () => clearInterval(timerIdRef.current);
    }, [endTime, handleFinish]);

    // 3. Auto-submit answer
    const handleAnswerSelect = (questionid, optionid) => {
        setSelectedAnswers(prev => ({ ...prev, [questionid]: optionid }));
        axios.post('http://127.0.0.1:5000/student/submit', {
            attemptid: attemptId, questionid: questionid, selectedoptionid: optionid
        }).catch(err => console.error("Auto-submit failed:", err));
    };

    // 4. Navigation
    const handleNext = () => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
    const handlePrevious = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); };
    
    // --- Render Logic ---
    if (isLoading) return <div style={pageStyle}><h2>Loading Exam...</h2></div>;
    if (error) return <div style={pageStyle}><h2 style={{color: 'red'}}>{error}</h2><Link to="/student/dashboard">Back to Dashboard</Link></div>;
    if (questions.length === 0) return <div style={pageStyle}><h2>No questions found for this exam.</h2></div>;

    const currentQuestion = questions[currentQuestionIndex];
    const currentSelection = selectedAnswers[currentQuestion.questionid];

    return (
        <div style={pageStyle}>
            <div style={examBoxStyle}>
                <div style={headerStyle}>
                    <h2 style={{margin: 0, color: '#444'}}>
                        {examTitle}
                    </h2>
                    {timeLeft && <div style={timerStyle}>Time Left: {timeLeft}</div>}
                </div>
                
                <div style={questionBodyStyle}>
                    <div style={qTextStyle}>{currentQuestionIndex + 1}. {currentQuestion.questiontext}</div>
                    <div>
                        {currentQuestion.options.map(option => {
                            const isSelected = currentSelection === option.optionid;
                            return (
                                <label key={option.optionid} style={{...optionStyle, backgroundColor: isSelected ? '#e6f7ff' : '#fff', borderColor: isSelected ? '#007BFF' : '#ccc'}}>
                                    <input type="radio" name={`question_${currentQuestion.questionid}`} style={{display: 'none'}} checked={isSelected} onChange={() => handleAnswerSelect(currentQuestion.questionid, option.optionid)} />
                                    {option.optiontext}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div style={navStyle}>
                    <button style={navButtonStyle} onClick={handlePrevious} disabled={currentQuestionIndex === 0}>&larr; Previous</button>
                    {currentQuestionIndex === questions.length - 1 ? (
                        <button style={finishButtonStyle} onClick={() => handleFinish(false)} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Finish Exam'}
                        </button>
                    ) : (
                        <button style={navButtonStyle} onClick={handleNext}>Next &rarr;</button>
                    )}
                </div>
            </div>
        </div>
    );
}
export default TakeExam;