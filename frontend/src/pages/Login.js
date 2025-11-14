import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://127.0.0.1:5000/login', {
                email: email,
                password: password
            });

            if (response.data.status === 'success') {
                login(response.data);
                if (response.data.role === 'student') {
                    navigate('/student/dashboard');
                } else if (response.data.role === 'instructor') {
                    navigate('/instructor/dashboard');
                }
            } else {
                setError(response.data.message || 'Login failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your email and password.');
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        },
        card: {
            background: 'white',
            width: '100%',
            maxWidth: '420px',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            padding: '40px',
            animation: 'slideUp 0.5s ease-out'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px'
        },
        title: {
            margin: '0 0 10px 0',
            fontSize: '28px',
            color: '#333',
            fontWeight: '700'
        },
        subtitle: {
            margin: '0',
            color: '#666',
            fontSize: '14px'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        label: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
        },
        input: {
            padding: '12px 16px',
            border: '2px solid #e1e4e8',
            borderRadius: '8px',
            fontSize: '15px',
            transition: 'all 0.3s ease',
            outline: 'none'
        },
        inputFocus: {
            borderColor: '#667eea',
            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
        },
        error: {
            background: '#fee',
            color: '#c33',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderLeft: '4px solid #c33'
        },
        button: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '10px'
        },
        footer: {
            textAlign: 'center',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e1e4e8'
        },
        link: {
            color: '#667eea',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
        }
    };

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                input::placeholder {
                    color: #a0a0a0;
                }
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
                }
                button:active {
                    transform: translateY(0);
                }
                a:hover {
                    color: #764ba2;
                    text-decoration: underline;
                }
            `}</style>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Welcome</h2>
                    <p style={styles.subtitle}> login to your account</p>
                </div>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="email" style={styles.label}>Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            style={styles.input}
                        />
                    </div>
                    {error && (
                        <div style={styles.error}>
                            <span>⚠</span> {error}
                        </div>
                    )}
                    <button type="submit" style={styles.button}>
                        Login
                    </button>
                </form>
                
            </div>
        </div>
    );
}

export default Login;