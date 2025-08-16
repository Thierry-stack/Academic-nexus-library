// src/components/LibrarianDashboard.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SearchStatistics from './SearchStatistics';

// Add fadeIn animation style
const styles = document.createElement('style');
styles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styles);

// Set the API URL dynamically
const API_URL = process.env.REACT_APP_API_URL;

function LibrarianDashboard() {
    const { token, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('books');
    const [books, setBooks] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        published_date: '',
        description: '',
        shelf_number: '',
        row_position: ''
    });
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [currentCoverImageUrl, setCurrentCoverImageUrl] = useState('');
    const [editingBookId, setEditingBookId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [expandedBookId, setExpandedBookId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);

    // Filter books based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredBooks(books);
        } else {
            const lowercasedFilter = searchTerm.toLowerCase();
            const filtered = books.filter(book => 
                book.title.toLowerCase().includes(lowercasedFilter) ||
                book.author?.toLowerCase().includes(lowercasedFilter) ||
                book.isbn?.toLowerCase().includes(lowercasedFilter)
            );
            setFilteredBooks(filtered);
        }
    }, [searchTerm, books]);

    const api = axios.create({
        // Use the dynamic API_URL
        baseURL: `${API_URL}/api/librarian`,
    });

    api.interceptors.request.use(config => {
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }, error => {
        return Promise.reject(error);
    });

    const fetchBooks = useCallback(async () => {
        try {
            setError('');
            // Use the dynamic API_URL
            const res = await axios.get(`${API_URL}/api/books`);
            setBooks(res.data);
            setFilteredBooks(res.data); // Initialize filtered books with all books
        } catch (err) {
            console.error('Error fetching books:', err.response ? err.response.data : err.message);
            setError('Failed to fetch books.');
        }
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const handleChange = (e) => {
        if (e.target.name === 'coverImage') {
            setCoverImageFile(e.target.files[0]);
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const dataToSend = new FormData();
            for (const key in formData) {
                dataToSend.append(key, formData[key]);
            }
            if (coverImageFile) {
                dataToSend.append('coverImage', coverImageFile);
            } else if (editingBookId && currentCoverImageUrl === null) {
                dataToSend.append('cover_image_url', '');
            }

            if (editingBookId) {
                await api.put(`/books/${editingBookId}`, dataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setMessage('Book updated successfully!');
            } else {
                await api.post('/books', dataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setMessage('Book added successfully!');
            }
            setFormData({
                title: '', author: '', isbn: '', published_date: '', description: '',
                shelf_number: '', row_position: ''
            });
            setCoverImageFile(null);
            setCurrentCoverImageUrl('');
            setEditingBookId(null);
            setShowAddForm(false);
            fetchBooks();
        } catch (err) {
            console.error('Book operation failed:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Operation failed.');
        }
    };

    const handleEdit = (book) => {
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            published_date: book.published_date ? book.published_date.split('T')[0] : '',
            description: book.description || '',
            shelf_number: book.shelf_number || '',
            row_position: book.row_position || ''
        });
        setCurrentCoverImageUrl(book.cover_image_url || '');
        setCoverImageFile(null);
        setEditingBookId(book.id);
        setShowAddForm(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id, e) => {
        // Safely handle the event if it exists
        if (e && typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
        
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await api.delete(`/books/${id}`);
                setMessage('Book deleted successfully!');
                fetchBooks();
                setExpandedBookId(null);
            } catch (err) {
                console.error('Error deleting book:', err);
                setError(err.response?.data?.message || 'Failed to delete book. Please try again.');
            }
        }
    };

    const toggleBookDetails = (bookId, e) => {
        e.stopPropagation();
        setExpandedBookId(expandedBookId === bookId ? null : bookId);
    };

    const handleLogout = () => {
        logout();
    };

    const renderBooksTab = () => {
        return (
            <div style={{ padding: '20px', maxWidth: '1000px', margin: '20px auto' }}>
                {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
                {message && <div className="success-message" style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}

                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => {
                            setShowAddForm(true);
                            setEditingBookId(null);
                            setFormData({
                                title: '', author: '', isbn: '', published_date: '', description: '',
                                shelf_number: '', row_position: ''
                            });
                            setCoverImageFile(null);
                            setCurrentCoverImageUrl('');
                        }}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '5px',
                            border: 'none',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Add New Book
                    </button>
                </div>

                {showAddForm && (
                    <div style={{ backgroundColor: 'var(--card-background)', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px var(--shadow-light)', marginBottom: '30px' }}>
                        <h3 style={{ color: 'var(--secondary-color)', textAlign: 'center', marginBottom: '20px' }}>
                            {editingBookId ? 'Edit Book' : 'Add New Book'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label>Title:</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label>Author:</label>
                                    <input type="text" name="author" value={formData.author} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label>ISBN:</label>
                                    <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label>Published Date:</label>
                                    <input type="date" name="published_date" value={formData.published_date} onChange={handleChange} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label>Description:</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label>Shelf Number:</label>
                                    <input type="text" name="shelf_number" value={formData.shelf_number} onChange={handleChange} />
                                </div>
                                <div>
                                    <label>Row Position:</label>
                                    <input type="text" name="row_position" value={formData.row_position} onChange={handleChange} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label>Cover Image:</label>
                                    <input type="file" name="coverImage" onChange={handleChange} style={{ display: 'block', marginTop: '5px' }} />
                                    {currentCoverImageUrl && (
                                        <img
                                            // Use the dynamic API_URL
                                            src={currentCoverImageUrl.startsWith('http') ? currentCoverImageUrl : `${API_URL}${currentCoverImageUrl}`}
                                            alt="Current Cover"
                                            style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '4px' }}
                                        />
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                {editingBookId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingBookId(null);
                                            setFormData({
                                                title: '', author: '', isbn: '', published_date: '', description: '',
                                                shelf_number: '', row_position: ''
                                            });
                                            setCoverImageFile(null);
                                            setCurrentCoverImageUrl('');
                                            setShowAddForm(false);
                                        }}
                                        style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', cursor: 'pointer' }}
                                >
                                    {editingBookId ? 'Update Book' : 'Add Book'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                <div style={{ marginTop: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                        <h3 style={{ color: 'var(--secondary-color)', margin: 0 }}>Books in Library</h3>
                        <div style={{ position: 'relative', maxWidth: '300px' }}>
                            <input
                                type="text"
                                placeholder="Search books by title, author, or ISBN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    paddingRight: '30px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9em',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <span style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#666',
                                pointerEvents: 'none'
                            }}>
                                🔍
                            </span>
                        </div>
                    </div>
                    {searchTerm && (
                        <div style={{ marginBottom: '15px', color: '#666', fontSize: '0.9em' }}>
                            {filteredBooks.length === 0 ? (
                                <span>No books found matching "{searchTerm}"</span>
                            ) : (
                                <span>Found {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} matching "{searchTerm}"</span>
                            )}
                            <button 
                                onClick={() => setSearchTerm('')}
                                style={{
                                    marginLeft: '10px',
                                    padding: '2px 8px',
                                    backgroundColor: 'transparent',
                                    color: 'var(--primary-color)',
                                    border: '1px solid var(--primary-color)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.8em',
                                    transition: 'all 0.2s ease',
                                    ':hover': {
                                        backgroundColor: 'var(--primary-color)',
                                        color: 'white'
                                    }
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {(searchTerm ? filteredBooks : books).map(book => (
                            <div 
                                key={book.id} 
                                onClick={(e) => toggleBookDetails(book.id, e)}
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
                                    overflow: 'hidden',
                                    aspectRatio: '2/3'
                                }}>
                                    {book.cover_image_url ? (
                                        <img
                                            // Use the dynamic API_URL
                                            src={book.cover_image_url.startsWith('http') ? book.cover_image_url : `${API_URL}${book.cover_image_url}`}
                                            alt={`Cover of ${book.title}`}
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'cover',
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
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block', 
                                                borderRadius: '4px' 
                                            }}
                                        />
                                    )}
                                </div>
                                {/* Book Title */}
                                <h4 style={{ 
                                    color: 'var(--primary-color)', 
                                    margin: '0 0 10px 0', 
                                    textAlign: 'center',
                                    fontSize: '1em',
                                    fontWeight: '600',
                                    width: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {book.title}
                                </h4>

                                {/* Author */}
                                <p style={{ 
                                    fontSize: '0.9em', 
                                    color: 'var(--light-text-color)', 
                                    textAlign: 'center', 
                                    margin: '0 0 10px 0',
                                    width: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    By: {book.author || 'N/A'}
                                </p>

                                {/* Additional Details - Only shown when expanded */}
                                {expandedBookId === book.id && (
                                    <div style={{ 
                                        width: '100%',
                                        marginTop: '10px',
                                        paddingTop: '10px',
                                        borderTop: '1px solid #eee',
                                        animation: 'fadeIn 0.3s ease-in-out'
                                    }}>
                                        <p style={{ fontSize: '0.9em', color: 'var(--light-text-color)', textAlign: 'center', margin: '5px 0' }}>
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

                                {/* Action Buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    marginTop: '15px',
                                    paddingTop: '15px',
                                    width: '100%',
                                    borderTop: '1px solid #eee'
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(book);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            backgroundColor: 'var(--secondary-color)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9em',
                                            transition: 'all 0.2s ease',
                                            ':hover': {
                                                opacity: 0.9,
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(book.id, e);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9em',
                                            transition: 'all 0.2s ease',
                                            ':hover': {
                                                opacity: 0.9,
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'books':
                return renderBooksTab();
            case 'search-stats':
                return <SearchStatistics />;
            default:
                return renderBooksTab();
        }
    };

    return (
        <div style={{ 
            fontFamily: 'Arial, sans-serif', 
            backgroundColor: '#f4f7f9', 
            minHeight: '100vh', 
            padding: '20px',
            marginTop: '70px' // Add margin to account for the fixed navbar
        }}>
            <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
                <h2 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '30px' }}>Librarian Dashboard</h2>
                <button 
                    onClick={logout} 
                    style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: '#c0392b',
                        }
                    }}
                >
                    Logout
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px', maxWidth: '1000px', margin: '0 auto' }}>
                <button onClick={() => setActiveTab('books')} style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'books' ? 'var(--primary-color)' : '#e0e0e0',
                    color: activeTab === 'books' ? 'white' : '#333'
                }}>
                    Manage Books
                </button>
                <button onClick={() => setActiveTab('search-stats')} style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'search-stats' ? 'var(--primary-color)' : '#e0e0e0',
                    color: activeTab === 'search-stats' ? 'white' : '#333'
                }}>
                    Search Statistics
                </button>
            </div>
            
            {renderTabContent()}
        </div>
    );
}

export default LibrarianDashboard;