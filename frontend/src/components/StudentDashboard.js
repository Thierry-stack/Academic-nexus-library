// src/components/StudentDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = () => {
    const { token } = useContext(AuthContext);
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [expandedBookId, setExpandedBookId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [currentSearchTerm, setCurrentSearchTerm] = useState('');
    const [requestStatus, setRequestStatus] = useState({ show: false, message: '', isError: false });

    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Fetch all books on component mount
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/books`);
                if (!response.ok) {
                    throw new Error('Failed to fetch books');
                }
                const data = await response.json();
                setBooks(data);
                setFilteredBooks(data);
            } catch (err) {
                setError('Failed to load books. Please try again later.');
                console.error('Error fetching books:', err);
            }
        };

        fetchBooks();
    }, []);

    const fetchSuggestions = async (query) => {
        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/api/books/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }
            const data = await response.json();
            const formattedSuggestions = data.map(book => ({
                id: book.id,
                value: book.title
            }));
            setSuggestions(formattedSuggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        }
    };

    // Debounce effect for search suggestions
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm.length > 1) {
                fetchSuggestions(searchTerm);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setActiveSuggestion(0);
        setShowSuggestions(true);
    };

    const handleSearchSubmit = async () => {
        if (!searchTerm) {
            setFilteredBooks(books);
            setExpandedBookId(null);
            return;
        }

        setCurrentSearchTerm(searchTerm);
        setExpandedBookId('search-active');

        try {
            const trackResponse = await fetch(`${backendUrl}/api/search-stats/track-search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: searchTerm }),
            });

            if (!trackResponse.ok) {
                console.error('Failed to track search.');
            }

            const searchResponse = await fetch(`${backendUrl}/api/books/search?q=${encodeURIComponent(searchTerm)}`);
            if (!searchResponse.ok) {
                throw new Error('Search failed');
            }
            const data = await searchResponse.json();
            setFilteredBooks(data);
            if (data.length === 0) {
                setShowRequestModal(true);
            }
        } catch (error) {
            console.error('Search error:', error);
            setFilteredBooks([]);
            setShowRequestModal(true);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                const selectedSuggestion = suggestions[activeSuggestion];
                setSearchTerm(selectedSuggestion.value);
                setShowSuggestions(false);
                handleSearchSubmit();
            } else {
                handleSearchSubmit();
                setShowSuggestions(false);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeSuggestion < suggestions.length - 1) {
                setActiveSuggestion(prev => prev + 1);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeSuggestion > 0) {
                setActiveSuggestion(prev => prev - 1);
            }
        }
    };

    const handleBookRequest = async () => {
        if (!token) {
            setRequestStatus({ show: true, message: 'You must be logged in to request a book.', isError: true });
            setShowRequestModal(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/student/book-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: currentSearchTerm }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit request.');
            }

            setRequestStatus({
                show: true,
                message: 'Your request has been submitted successfully!',
                isError: false
            });
            setShowRequestModal(false);
            setSearchTerm('');
        } catch (err) {
            setRequestStatus({
                show: true,
                message: err.message || 'Failed to submit your request.',
                isError: true
            });
            setShowRequestModal(false);
        }
    };

    const toggleBookDetails = (id) => {
        setExpandedBookId(expandedBookId === id ? null : id);
    };

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '20px auto', backgroundColor: 'var(--background-color)', borderRadius: '8px', boxShadow: '0 4px 8px var(--shadow-light)' }}>
            <h2 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '30px' }}>Welcome, Student!</h2>
            <p style={{ textAlign: 'center', color: 'var(--light-text-color)', fontSize: '1.1em', marginBottom: '20px' }}>Explore our vast collection of books.</p>

            {/* Search Bar */}
            <div style={{ marginBottom: '30px', textAlign: 'center', position: 'relative', display: 'inline-block', width: '80%', maxWidth: '500px' }}>
                <input
                    type="text"
                    placeholder="Search books..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid var(--border-color)', fontSize: '1em' }}
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        backgroundColor: 'white',
                        border: '1px solid #dfe1e5',
                        borderRadius: '0 0 24px 24px',
                        boxShadow: '0 4px 6px rgba(32,33,36,.28)',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        textAlign: 'left',
                        marginTop: '-1px',
                        padding: '8px 0'
                    }}>
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={suggestion.value}
                                onClick={async () => {
                                    setSearchTerm(suggestion.value);
                                    setShowSuggestions(false);
                                    
                                    // Perform search without tracking
                                    try {
                                        const response = await fetch(`${backendUrl}/api/books/search?q=${encodeURIComponent(suggestion.value)}`);
                                        if (!response.ok) {
                                            throw new Error('Search failed');
                                        }
                                        const data = await response.json();
                                        setFilteredBooks(data);
                                        setExpandedBookId('search-active');
                                    } catch (error) {
                                        console.error('Search error:', error);
                                        setFilteredBooks([]);
                                    }
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                style={{
                                    padding: '6px 16px',
                                    cursor: 'pointer',
                                    backgroundColor: index === activeSuggestion ? '#f1f3f4' : 'white',
                                    color: '#212121',
                                    fontSize: '16px',
                                    lineHeight: '26px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'background-color 0.1s',
                                    fontFamily: 'Arial, sans-serif',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                <span style={{ marginRight: '12px', color: '#9aa0a6' }}>
                                    <svg focusable="false" width="24" height="24" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                                        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                                    </svg>
                                </span>
                                {suggestion.value}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Book List */}
            <div style={{ backgroundColor: 'var(--card-background)', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px var(--shadow-light)' }}>
                <h3 style={{ color: 'var(--secondary-color)', textAlign: 'center', marginBottom: '20px' }}>Available Books:</h3>
                {filteredBooks.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--light-text-color)' }}>No books found matching your search. Try a different term!</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {filteredBooks.map(book => (
                            <div key={book.id} 
                                style={{ 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: '8px', 
                                    padding: '15px', 
                                    backgroundColor: '#fff', 
                                    boxShadow: '0 1px 3px var(--shadow-light)', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    ':hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                    }
                                }}
                                onClick={() => toggleBookDetails(book.id)}
                            >
                                {/* Book Cover */}
                                <div style={{ 
                                    width: '100%', 
                                    maxWidth: '150px',
                                    marginBottom: '10px', 
                                    borderRadius: '4px',
                                    backgroundColor: '#e0e0e0',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {book.cover_image_url ? (
                                        <img
                                            src={book.cover_image_url.startsWith('http') ? book.cover_image_url : `${backendUrl}${book.cover_image_url}`}
                                            alt={`Cover of ${book.title}`}
                                            style={{ 
                                                maxWidth: '100%', 
                                                height: 'auto', 
                                                display: 'block', 
                                                borderRadius: '4px',
                                                transition: 'transform 0.3s ease'
                                            }}
                                            onError={(e) => { 
                                                e.target.onerror = null; 
                                                e.target.src = 'https://via.placeholder.com/150x200?text=No+Image'; 
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src="https://via.placeholder.com/150x200?text=No+Image"
                                            alt="No Cover Available"
                                            style={{ 
                                                maxWidth: '100%', 
                                                height: 'auto', 
                                                display: 'block', 
                                                borderRadius: '4px' 
                                            }}
                                        />
                                    )}
                                </div>
                                
                                {/* Book Title - Always Visible */}
                                <h4 style={{ 
                                    color: 'var(--primary-color)', 
                                    margin: '0 0 10px 0', 
                                    textAlign: 'center',
                                    fontSize: '1em',
                                    fontWeight: '600'
                                }}>
                                    {book.title}
                                </h4>

                                {/* Additional Details - Only shown when expanded or searching */}
                                {(expandedBookId === book.id || expandedBookId === 'search-active') && (
                                    <div style={{ 
                                        width: '100%',
                                        marginTop: '10px',
                                        paddingTop: '10px',
                                        borderTop: '1px solid #eee',
                                        animation: 'fadeIn 0.3s ease-in-out'
                                    }}>
                                        <p style={{ fontSize: '0.9em', color: 'var(--light-text-color)', textAlign: 'center', margin: '5px 0' }}>
                                            <strong>By:</strong> {book.author || 'N/A'}
                                        </p>
                                        <p style={{ fontSize: '0.85em', color: 'var(--light-text-color)', textAlign: 'center', margin: '5px 0' }}>
                                            <strong>ISBN:</strong> {book.isbn || 'N/A'}
                                        </p>
                                        <p style={{ fontSize: '0.85em', color: 'var(--light-text-color)', textAlign: 'center', margin: '5px 0' }}>
                                            <strong>Published:</strong> {book.published_date ? new Date(book.published_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                        {book.shelf_number && (
                                            <p style={{ fontSize: '0.85em', color: 'var(--light-text-color)', textAlign: 'center', margin: '5px 0' }}>
                                                <strong>Shelf:</strong> {book.shelf_number}
                                            </p>
                                        )}
                                        {book.row_position && (
                                            <p style={{ fontSize: '0.85em', color: 'var(--light-text-color)', textAlign: 'center', margin: '5px 0' }}>
                                                <strong>Row:</strong> {book.row_position}
                                            </p>
                                        )}
                                        {book.description && (
                                            <div style={{ 
                                                marginTop: '10px',
                                                padding: '8px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px'
                                            }}>
                                                <p style={{ 
                                                    fontSize: '0.85em', 
                                                    color: 'var(--text-color)', 
                                                    textAlign: 'left',
                                                    margin: 0,
                                                    lineHeight: '1.5'
                                                }}>
                                                    {book.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Click indicator */}
                                {expandedBookId !== 'search-active' && (
                                    <p style={{
                                        fontSize: '0.75em',
                                        color: 'var(--primary-color)',
                                        margin: '5px 0 0',
                                        fontStyle: 'italic',
                                        opacity: 0.7
                                    }}>
                                        {expandedBookId === book.id ? 'Click to collapse ▲' : 'Click for details ▼'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Book Request Modal */}
            {showRequestModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#333' }}>Book Not Found</h3>
                        <p>We couldn't find "{currentSearchTerm}" in our library.</p>
                        <p>Would you like us to consider adding this book to our collection?</p>
                        
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px',
                            marginTop: '20px'
                        }}>
                            <button
                                onClick={() => setShowRequestModal(false)}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                No, thanks
                            </button>
                            <button
                                onClick={handleBookRequest}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: '#4a90e2',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Yes, request this book
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Status Notification */}
            {requestStatus.show && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '15px 25px',
                    backgroundColor: requestStatus.isError ? '#ffebee' : '#e8f5e9',
                    color: requestStatus.isError ? '#c62828' : '#2e7d32',
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    zIndex: 1001,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    maxWidth: '400px'
                }}>
                    <span>{requestStatus.message}</span>
                    <button 
                        onClick={() => setRequestStatus({...requestStatus, show: false})}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            fontSize: '18px',
                            marginLeft: '10px'
                        }}
                    >
                        &times;
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
