// src/components/LibrarianLogin.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Set the API URL dynamically
const API_URL = process.env.REACT_APP_API_URL;

function LibrarianLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Use the dynamic API_URL
            const res = await axios.post(`${API_URL}/api/librarian/login`, {
                username,
                password,
            });
            
            const { token, role } = res.data;
            
            login(token, role);
            
            if (role === 'librarian') {
                navigate('/librarian'); 
            } else {
                navigate('/');
            }

        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', backgroundColor: 'var(--card-background)', borderRadius: '8px', boxShadow: '0 4px 8px var(--shadow-light)' }}>
            <h2 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '30px' }}>Librarian Login</h2>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <button 
                    type="submit" 
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        backgroundColor: 'var(--primary-color)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '1em',
                        fontWeight: 'bold'
                    }}
                >
                    Login
                </button>
            </form>
        </div>
    );
}

export default LibrarianLogin;