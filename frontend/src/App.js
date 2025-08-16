// src/App.js
import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; // No need for AuthProvider here
import Home from './components/Home';
import LibrarianLogin from './components/LibrarianLogin';
import LibrarianDashboard from './components/LibrarianDashboard';
import StudentDashboard from './components/StudentDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/librarian/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    const { isAuthenticated, role, logout } = useContext(AuthContext);

    return (
        <div className="App">
            <nav style={{
                backgroundColor: '#2c3e50',
                padding: '10px 20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                gap: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                        src={`${process.env.PUBLIC_URL}/logo.png`} 
                        alt="Logo" 
                        style={{ 
                            height: '40px', 
                            width: 'auto',
                            display: 'block' // Ensure the image is displayed as a block element
                        }} 
                    />
                    <span style={{ 
                        color: '#f1c40f', 
                        fontWeight: 'bold', 
                        fontSize: '1.3em',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}>ACADEMIC Nexus</span>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link to="/" style={{ 
                        color: '#ecf0f1', 
                        textDecoration: 'none', 
                        fontWeight: 'bold', 
                        fontSize: '1.1em'
                    }}>Home</Link>
                <Link to="/student" style={{ 
                    color: '#ecf0f1', 
                    textDecoration: 'none', 
                    fontWeight: 'bold', 
                    fontSize: '1.1em' 
                }}>Student Dashboard</Link>
                
                {!isAuthenticated ? (
                    <Link to="/librarian/login" style={{ 
                        color: '#ecf0f1', 
                        textDecoration: 'none', 
                        fontWeight: 'bold', 
                        fontSize: '1.1em' 
                    }}>Librarian Login</Link>
                ) : (
                    role === 'librarian' && (
                        <Link to="/librarian" style={{ 
                            color: '#ecf0f1', 
                            textDecoration: 'none', 
                            fontWeight: 'bold', 
                            fontSize: '1.1em' 
                        }}>Librarian Dashboard</Link>
                    )
                )}
                </div>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/librarian/login" element={<LibrarianLogin />} />
                <Route
                    path="/librarian"
                    element={
                        <ProtectedRoute allowedRoles={['librarian']}>
                            <LibrarianDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '50px', color: '#c0392b' }}>404 - Page Not Found</h2>} />
            </Routes>
        </div>
    );
}

export default App;