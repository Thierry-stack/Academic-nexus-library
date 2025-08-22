// src/components/StudentDashboard.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './StudentDashboard.css'; // Import the CSS file for styling

const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function StudentDashboard() {
    const { token } = useContext(AuthContext);
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedBookId, setExpandedBookId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestStatus, setRequestStatus] = useState({ show: false, message: '', isError: false });

    // Function to fetch all books
    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${backendUrl}/api/books`);
            setBooks(response.data);
            setFilteredBooks(response.data);
        } catch (err) {
            setError('Failed to load books. Please try again later.');
            console.error('Error fetching books:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch books on component mount
    useEffect(() => {
        fetchBooks();
    }, []);

    // Debounce for search suggestions
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length > 1) {
                fetchSuggestions(searchTerm);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
                if (searchTerm.length === 0) {
                    setFilteredBooks(books);
                    setExpandedBookId(null);
                }
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, books]);

    // Fetch search suggestions from backend (without tracking)
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        try {
            const response = await axios.get(`${backendUrl}/api/books/search?q=${encodeURIComponent(query)}`);
            const formattedSuggestions = response.data.map(item => ({
                id: item.id,
                title: item.title,
                author: item.author,
                value: item.title
            }));
            setSuggestions(formattedSuggestions);
            setShowSuggestions(formattedSuggestions.length > 0);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Handle search submission
    const handleSearchSubmit = async (searchValue) => {
        if (!searchValue || searchValue.trim() === '') {
            setFilteredBooks(books);
            return;
        }

        try {
            await axios.post(`${backendUrl}/api/search-stats/track-search`, { title: searchValue });
            const response = await axios.get(`${backendUrl}/api/books/search?q=${encodeURIComponent(searchValue)}`);
            setFilteredBooks(response.data);
            setExpandedBookId(response.data.length > 0 ? 'search-active' : null);
            if (response.data.length === 0) {
                setShowRequestModal(true);
            }
        } catch (error) {
            console.error('Search error:', error);
            setFilteredBooks([]);
            setShowRequestModal(true);
        }
    };

    // Handle form submission and enter key press
    const handleSearchFormSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        handleSearchSubmit(searchTerm);
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.value);
        setShowSuggestions(false);
        const selectedBook = books.find(book => book.id === suggestion.id);
        if (selectedBook) {
            setFilteredBooks([selectedBook]);
            setExpandedBookId(selectedBook.id);
        } else {
            handleSearchSubmit(suggestion.value);
        }
    };

    // Handle purchase request submission
    const handleBookRequest = async () => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/student/book-requests`,
                { title: searchTerm },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setRequestStatus({
                show: true,
                message: 'Your request has been submitted. The library will consider purchasing this book.',
                isError: false
            });
            setShowRequestModal(false);
            setSearchTerm('');
        } catch (error) {
            setRequestStatus({
                show: true,
                message: error.response?.data?.message || 'Failed to submit your request.',
                isError: true
            });
            console.error('Error submitting book request:', error);
        }
    };

    const toggleBookDetails = (bookId) => {
        setExpandedBookId(expandedBookId === bookId ? null : bookId);
    };

    if (loading) {
        return <div className="loading">Loading books...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="student-dashboard">
            <h2 className="dashboard-title">Welcome, Student!</h2>
            <p className="dashboard-intro">Explore our vast collection of books.</p>

            <form onSubmit={handleSearchFormSubmit} className="search-container">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search books..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setActiveSuggestion(0);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowDown' && activeSuggestion < suggestions.length - 1) {
                                e.preventDefault();
                                setActiveSuggestion(prev => prev + 1);
                            } else if (e.key === 'ArrowUp' && activeSuggestion > 0) {
                                e.preventDefault();
                                setActiveSuggestion(prev => prev - 1);
                            } else if (e.key === 'Enter') {
                                e.preventDefault();
                                if (showSuggestions && suggestions.length > 0) {
                                    handleSuggestionClick(suggestions[activeSuggestion]);
                                } else {
                                    handleSearchFormSubmit(e);
                                }
                            }
                        }}
                        onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="suggestions-dropdown">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={suggestion.id}
                                    className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <svg className="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
                                    {suggestion.value}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </form>

            <div className="book-list-container">
                <h3 className="list-title">Available Books:</h3>
                {filteredBooks.length === 0 && searchTerm.length > 0 ? (
                    <p className="no-books-found">No books found matching your search. Would you like to request this book?</p>
                ) : filteredBooks.length === 0 && searchTerm.length === 0 ? (
                    <p className="no-books-found">No books available in the library.</p>
                ) : (
                    <div className="book-grid">
                        {filteredBooks.map(book => (
                            <div
                                key={book.id}
                                className="book-card"
                                onClick={() => toggleBookDetails(book.id)}
                            >
                                <div className="book-cover-container">
                                    <img
                                        src={book.cover_image_url?.startsWith('http') ? book.cover_image_url : `${backendUrl}${book.cover_image_url}`}
                                        alt={`Cover of ${book.title}`}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150x200?text=No+Image'; }}
                                    />
                                </div>
                                <h4 className="book-title">{book.title}</h4>
                                {(expandedBookId === book.id || (expandedBookId === 'search-active' && filteredBooks.length > 0)) && (
                                    <div className="book-details expanded">
                                        <p><strong>By:</strong> {book.author || 'N/A'}</p>
                                        <p><strong>ISBN:</strong> {book.isbn || 'N/A'}</p>
                                        <p><strong>Published:</strong> {book.published_date ? new Date(book.published_date).toLocaleDateString() : 'N/A'}</p>
                                        {book.shelf_number && <p><strong>Shelf:</strong> {book.shelf_number}</p>}
                                        {book.row_position && <p><strong>Row:</strong> {book.row_position}</p>}
                                        {book.description && <div className="book-description"><p>{book.description}</p></div>}
                                    </div>
                                )}
                                <p className="click-indicator">
                                    {expandedBookId === book.id ? 'Click to collapse ▲' : 'Click for details ▼'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showRequestModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Book Not Found</h3>
                        <p>We couldn't find "{searchTerm}" in our library.</p>
                        <p>Would you like us to consider adding this book to our collection?</p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowRequestModal(false)}>No, thanks</button>
                            <button className="btn-primary" onClick={handleBookRequest}>Yes, request this book</button>
                        </div>
                    </div>
                </div>
            )}

            {requestStatus.show && (
                <div className={`notification ${requestStatus.isError ? 'error' : 'success'}`}>
                    <span>{requestStatus.message}</span>
                    <button className="close-btn" onClick={() => setRequestStatus({ ...requestStatus, show: false })}>
                        &times;
                    </button>
                </div>
            )}
        </div>
    );
}

export default StudentDashboard;
