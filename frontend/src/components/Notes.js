import React, { useState } from 'react';
import { FaPlus, FaSearch, FaFileAlt, FaTrash, FaDownload, FaShare } from 'react-icons/fa';

const Notes = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [notes, setNotes] = useState([
        { id: 1, title: 'Mathematics Notes', date: '2025-08-10', fileType: 'pdf' },
        { id: 2, title: 'Physics Formulas', date: '2025-08-11', fileType: 'doc' },
        { id: 3, title: 'Chemistry Reactions', date: '2025-08-12', fileType: 'pdf' },
    ]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDelete = (id) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>My Notes</h2>
                <div style={styles.searchContainer}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={styles.searchInput}
                    />
                </div>
                <button style={styles.addButton}>
                    <FaPlus style={{ marginRight: '8px' }} />
                    Add New Note
                </button>
            </div>

            <div style={styles.notesGrid}>
                {filteredNotes.map(note => (
                    <div key={note.id} style={styles.noteCard}>
                        <div style={styles.noteHeader}>
                            <FaFileAlt style={styles.fileIcon} />
                            <span style={styles.noteTitle}>{note.title}</span>
                        </div>
                        <div style={styles.noteMeta}>
                            <span>Uploaded: {note.date}</span>
                            <span style={styles.fileType}>{note.fileType.toUpperCase()}</span>
                        </div>
                        <div style={styles.noteActions}>
                            <button style={styles.actionButton} title="Download">
                                <FaDownload />
                            </button>
                            <button style={styles.actionButton} title="Share">
                                <FaShare />
                            </button>
                            <button 
                                style={{ ...styles.actionButton, color: '#ff4d4f' }} 
                                title="Delete"
                                onClick={() => handleDelete(note.id)}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    searchContainer: {
        position: 'relative',
        flex: '1',
        maxWidth: '400px',
        minWidth: '200px',
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#666',
    },
    searchInput: {
        width: '100%',
        padding: '10px 15px 10px 40px',
        borderRadius: '5px',
        border: '1px solid #d9d9d9',
        fontSize: '14px',
    },
    addButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.3s',
    },
    notesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '20px',
    },
    noteCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
    },
    noteHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
    },
    fileIcon: {
        fontSize: '24px',
        color: '#1890ff',
        marginRight: '12px',
    },
    noteTitle: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#333',
    },
    noteMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#666',
        marginBottom: '16px',
    },
    fileType: {
        backgroundColor: '#f0f0f0',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: '500',
    },
    noteActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        borderTop: '1px solid #f0f0f0',
        paddingTop: '12px',
    },
    actionButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#666',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        borderRadius: '4px',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#f5f5f5',
            color: '#1890ff',
        },
    },
};

export default Notes;
