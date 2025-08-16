// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/images/homebackground.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'auto'
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.4)', // Reduced opacity from 0.7 to 0.4
                padding: '40px',
                borderRadius: '15px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                maxWidth: '800px',
                width: '100%',
                margin: '20px',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
            }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginBottom: '0.5rem'
                }}>
                    <span style={{ color: 'var(--primary-color)' }}>Digital</span>
                    <span style={{ color: 'var(--secondary-color)' }}>Library</span>
                </h1>
    
            </div>

            <p style={{
                color: 'blue',
                fontSize: '1.2em',
                marginBottom: '40px',
                maxWidth: '600px',
                textAlign: 'center'
            }}>
                Your gateway to a world of knowledge. Whether you're a student looking for your next read or a librarian managing the collection, we've got you covered.
            </p>

            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/student" style={{
                    backgroundColor: 'var(--secondary-color)',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '1.1em',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transition: 'background-color 0.3s ease',
                    cursor: 'pointer'
                }}>
                    Student
                </Link>

                <Link to="/librarian/login" style={{
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '1.1em',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transition: 'background-color 0.3s ease',
                    cursor: 'pointer'
                }}>
                    Librarian
                </Link>
            </div>
            </div>
        </div>
    );
}

export default Home;
