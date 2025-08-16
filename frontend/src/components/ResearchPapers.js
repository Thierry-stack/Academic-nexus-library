import React, { useState } from 'react';

const ResearchPapers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    
    const papers = [
        {
            id: 1,
            title: 'Advancements in Quantum Computing',
            author: 'Dr. Sarah Chen',
            year: '2025',
            category: 'Computer Science',
            pages: '24',
            citations: '142',
            isFavorite: true
        },
        {
            id: 2,
            title: 'Neural Networks in Healthcare',
            author: 'Prof. James Wilson',
            year: '2024',
            category: 'Artificial Intelligence',
            pages: '32',
            citations: '89',
            isFavorite: false
        },
        {
            id: 3,
            title: 'Sustainable Energy Solutions',
            author: 'Dr. Maria Garcia',
            year: '2023',
            category: 'Environmental Science',
            pages: '18',
            citations: '56',
            isFavorite: true
        }
    ];

    const categories = ['All', 'Computer Science', 'Artificial Intelligence', 'Environmental Science'];

    const filteredPapers = papers.filter(paper => {
        const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           paper.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All' || paper.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const toggleFavorite = (id) => {
        // In a real app, this would update the state
        console.log(`Toggled favorite for paper ${id}`);
    };

    return (
        <div style={styles.container}>
            <h2>Research Papers</h2>
            
            <div style={styles.controls}>
                <div style={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search papers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
                
                <select 
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    style={styles.filterSelect}
                >
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div style={styles.papersList}>
                {filteredPapers.map(paper => (
                    <div key={paper.id} style={styles.paperCard}>
                        <div style={styles.paperHeader}>
                            <h3 style={styles.paperTitle}>
                                {paper.title}
                            </h3>
                            <button 
                                onClick={() => toggleFavorite(paper.id)}
                                style={styles.favoriteButton}
                            >
                                {paper.isFavorite ? '★' : '☆'}
                            </button>
                        </div>
                        
                        <div style={styles.paperMeta}>
                            <span>By {paper.author}</span>
                            <span>{paper.year}</span>
                            <span>{paper.pages} pages</span>
                            <span>{paper.citations} citations</span>
                        </div>
                        
                        <div style={styles.paperCategory}>
                            {paper.category}
                        </div>
                        
                        <div style={styles.paperActions}>
                            <button style={styles.viewButton}>
                                View Paper
                            </button>
                            <button style={styles.downloadButton}>
                                Download PDF
                            </button>
                            <button style={styles.citeButton}>
                                Cite
                            </button>
                        </div>
                    </div>
                ))}
                
                {filteredPapers.length === 0 && (
                    <div style={styles.noResults}>
                        No research papers found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px'
    },
    controls: {
        display: 'flex',
        gap: '15px',
        margin: '20px 0',
        flexWrap: 'wrap'
    },
    searchContainer: {
        flex: 1,
        minWidth: '250px'
    },
    searchInput: {
        width: '100%',
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px'
    },
    filterSelect: {
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        minWidth: '200px'
    },
    papersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    paperCard: {
        backgroundColor: 'white',
        borderRadius: '5px',
        padding: '20px',
        border: '1px solid #eee',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    paperHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px'
    },
    paperTitle: {
        margin: '0',
        fontSize: '18px',
        color: '#1890ff',
        flex: 1
    },
    favoriteButton: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#ffc107',
        padding: '0 5px'
    },
    paperMeta: {
        display: 'flex',
        gap: '15px',
        color: '#666',
        fontSize: '14px',
        marginBottom: '10px',
        flexWrap: 'wrap'
    },
    paperCategory: {
        display: 'inline-block',
        backgroundColor: '#e6f7ff',
        color: '#1890ff',
        padding: '2px 10px',
        borderRadius: '10px',
        fontSize: '12px',
        marginBottom: '15px'
    },
    paperActions: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
    },
    viewButton: {
        padding: '6px 12px',
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    downloadButton: {
        padding: '6px 12px',
        backgroundColor: 'white',
        color: '#1890ff',
        border: '1px solid #1890ff',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    citeButton: {
        padding: '6px 12px',
        backgroundColor: 'white',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    noResults: {
        textAlign: 'center',
        padding: '40px 20px',
        color: '#666',
        backgroundColor: '#f9f9f9',
        borderRadius: '5px',
        border: '1px dashed #ddd'
    }
};

export default ResearchPapers;
