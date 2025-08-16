import React, { useState, useEffect } from 'react';
import './StudentDashboard.css'; // Assuming this is your CSS file
import Notes from './Notes';
import ResearchPapers from './ResearchPapers';
import QnA from './QnA';

// Replace this placeholder with your actual cloud API endpoint URL
const CLOUD_API_URL = "https://your-cloud-api-url.com"; 

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('books');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [expandedBookId, setExpandedBookId] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [currentSearchTerm, setCurrentSearchTerm] = useState('');
    const [requestStatus, setRequestStatus] = useState({ show: false, message: '', isError: false });

    // Fetch all books on initial load
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`${CLOUD_API_URL}/api/books`);
                if (!response.ok) {
                    throw new Error('Failed to fetch books');
                }
                const data = await response.json();
                setBooks(data);
                setFilteredBooks(data); // Initially show all books
            } catch (err) {
                setError('Failed to load books. Please try again later.');
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // Handle search input changes with a debounce for suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                const response = await fetch(`${CLOUD_API_URL}/api/books/suggestions?q=${encodeURIComponent(searchTerm)}`);
                const data = await response.json();
                setSuggestions(data.map(item => ({ value: item.title }))); // Adjust based on your API response
                setShowSuggestions(true);
            } catch (err) {
                console.error('Suggestions fetch error:', err);
                setSuggestions([]);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchSuggestions();
        }, 300); // Debounce time in ms

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSearch = async (term) => {
        if (!term) {
            setFilteredBooks(books);
            setExpandedBookId(null);
            setShowRequestModal(false);
            return;
        }

        setCurrentSearchTerm(term);
        try {
            const response = await fetch(`${CLOUD_API_URL}/api/books/search?q=${encodeURIComponent(term)}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const data = await response.json();

            if (data.length > 0) {
                setFilteredBooks(data);
                setExpandedBookId('search-active');
            } else {
                setFilteredBooks([]);
                setExpandedBookId(null);
                setShowRequestModal(true);
            }
        } catch (error) {
            console.error('Search error:', error);
            setFilteredBooks([]);
            setShowRequestModal(true);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setActiveSuggestion(0);
    };

    const handleKeyDown = (e) => {
        if (showSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion((prev) => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter') {
                if (suggestions[activeSuggestion]) {
                    setSearchTerm(suggestions[activeSuggestion].value);
                    handleSearch(suggestions[activeSuggestion].value);
                } else {
                    handleSearch(searchTerm);
                }
                setShowSuggestions(false);
            }
        } else if (e.key === 'Enter') {
            handleSearch(searchTerm);
        }
    };

    const handleBookRequest = async () => {
        try {
            const response = await fetch(`${CLOUD_API_URL}/api/book-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: currentSearchTerm }),
            });

            if (!response.ok) {
                throw new Error('Request failed');
            }

            setRequestStatus({
                show: true,
                message: `Thank you! Your request for "${currentSearchTerm}" has been submitted.`,
                isError: false
            });
            setShowRequestModal(false);

        } catch (error) {
            console.error('Book request error:', error);
            setRequestStatus({
                show: true,
                message: 'Failed to submit request. Please try again.',
                isError: true
            });
            setShowRequestModal(false);
        }
    };

    // Render the books tab content
    const renderBooksTab = () => (
        <div className="tab-content books-tab">
            {filteredBooks.length > 0 ? (
                <div className="books-list">
                    {filteredBooks.map((book) => (
                        <div
                            key={book.id}
                            className={`book-card ${expandedBookId === book.id ? 'expanded' : ''}`}
                            onClick={() => {
                                if (expandedBookId === 'search-active') {
                                    setExpandedBookId(book.id);
                                } else {
                                    setExpandedBookId(expandedBookId === book.id ? null : book.id);
                                }
                            }}
                        >
                            <div className="book-summary">
                                <h3>{book.title}</h3>
                            </div>
                            {/* Additional Details - Only shown when expanded or searching */}
                            {(expandedBookId === book.id || expandedBookId === 'search-active') && (
                                <div className="additional-details">
                                    <p className="author">
                                        <strong>By:</strong> {book.author || 'N/A'}
                                    </p>
                                    <p className="isbn">
                                        <strong>ISBN:</strong> {book.isbn || 'N/A'}
                                    </p>
                                    <p className="published">
                                        <strong>Published:</strong> {book.published_date ? new Date(book.published_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                    {book.shelf_number && (
                                        <p className="shelf">
                                            <strong>Shelf:</strong> {book.shelf_number}
                                        </p>
                                    )}
                                    {book.row_position && (
                                        <p className="row">
                                            <strong>Row:</strong> {book.row_position}
                                        </p>
                                    )}
                                    {book.description && (
                                        <div className="description-container">
                                            <p className="description-text">
                                                {book.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Click indicator */}
                            {expandedBookId !== 'search-active' && (
                                <p className="click-indicator">
                                    {expandedBookId === book.id ? 'Click to collapse ▲' : 'Click for details ▼'}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-results-state">No books found matching your search.</div>
            )}
        </div>
    );

    // Render the notes tab content
    const renderNotesTab = () => (
        <Notes />
    );

    // Render the research papers tab content
    const renderResearchTab = () => (
        <ResearchPapers />
    );

    // Render the Q&A tab content
    const renderQnATab = () => (
        <QnA />
    );

    if (loading) {
        return <div className="loading-state">Loading books...</div>;
    }

    if (error) {
        return <div className="error-state">{error}</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Welcome, Student!</h2>

                {/* Dropdown Menu */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                        className="dropdown-button"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        {activeTab === 'books' && 'BOOKS'}
                        {activeTab === 'notes' && 'NOTES'}
                        {activeTab === 'research' && 'RESEARCH PAPERS'}
                        {activeTab === 'qna' && 'Q&A'}
                        <span style={{ fontSize: '0.8em' }}>▼</span>
                    </button>

                    {showDropdown && (
                        <div className="dropdown-menu">
                            {[
                                { id: 'books', label: 'BOOKS' },
                                { id: 'notes', label: 'NOTES' },
                                { id: 'research', label: 'RESEARCH PAPERS' },
                                { id: 'qna', label: 'Q&A' }
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setShowDropdown(false);
                                    }}
                                    className={`dropdown-item ${activeTab === item.id ? 'active' : ''}`}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--light-text-color)', fontSize: '1.1em', marginBottom: '20px' }}>
                {activeTab === 'books' && 'Explore our vast collection of books.'}
                {activeTab === 'notes' && 'Access and manage your study notes.'}
                {activeTab === 'research' && 'Browse through research papers and publications.'}
                {activeTab === 'qna' && 'Get answers to your questions from the community.'}
            </p>

            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search books..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="search-input"
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-container">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={suggestion.value}
                                onClick={async () => {
                                    setSearchTerm(suggestion.value);
                                    setShowSuggestions(false);
                                    // Perform search without tracking
                                    try {
                                        const response = await fetch(`${CLOUD_API_URL}/api/books/search?q=${encodeURIComponent(suggestion.value)}`);
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
                                className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
                            >
                                <span className="suggestion-icon">
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

            {/* Tab Content */}
            {activeTab === 'books' && renderBooksTab()}
            {activeTab === 'notes' && renderNotesTab()}
            {activeTab === 'research' && renderResearchTab()}
            {activeTab === 'qna' && renderQnATab()}

            {/* Book Request Modal */}
            {showRequestModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ marginTop: 0, color: '#333' }}>Book Not Found</h3>
                        <p>We couldn't find "{currentSearchTerm}" in our library.</p>
                        <p>Would you like us to consider adding this book to our collection?</p>

                        <div className="modal-actions">
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="modal-button modal-button-secondary"
                            >
                                No, thanks
                            </button>
                            <button
                                onClick={handleBookRequest}
                                className="modal-button modal-button-primary"
                            >
                                Yes, request this book
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Status Notification */}
            {requestStatus.show && (
                <div className={`notification ${requestStatus.isError ? 'notification-error' : 'notification-success'}`}>
                    <span>{requestStatus.message}</span>
                    <button
                        onClick={() => setRequestStatus({ ...requestStatus, show: false })}
                        className="notification-close"
                    >
                        &times;
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;