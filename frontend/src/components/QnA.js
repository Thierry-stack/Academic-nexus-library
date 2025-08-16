import React, { useState } from 'react';

const QnA = () => {
    const [activeTab, setActiveTab] = useState('recent');
    
    const questions = [
        {
            id: 1,
            title: 'How to implement Redux in React?',
            author: 'JohnDoe',
            date: '2 hours ago',
            votes: 15,
            answers: 5,
            tags: ['react', 'redux']
        },
        {
            id: 2,
            title: 'Best practices for REST API authentication?',
            author: 'TechEnthusiast',
            date: '1 day ago',
            votes: 22,
            answers: 7,
            tags: ['api', 'authentication']
        }
    ];

    return (
        <div style={styles.container}>
            <h2>Q&A Forum</h2>
            
            <div style={styles.tabs}>
                <button 
                    style={activeTab === 'recent' ? styles.activeTab : styles.tab}
                    onClick={() => setActiveTab('recent')}
                >
                    Recent
                </button>
                <button 
                    style={activeTab === 'popular' ? styles.activeTab : styles.tab}
                    onClick={() => setActiveTab('popular')}
                >
                    Popular
                </button>
            </div>

            <div style={styles.questions}>
                {questions.map(question => (
                    <div key={question.id} style={styles.question}>
                        <div style={styles.votes}>
                            <div>{question.votes}</div>
                            <small>votes</small>
                        </div>
                        <div style={styles.answers}>
                            <div>{question.answers}</div>
                            <small>answers</small>
                        </div>
                        <div style={styles.content}>
                            <h3 style={styles.title}>{question.title}</h3>
                            <div style={styles.meta}>
                                <span>asked by {question.author}</span>
                                <span>{question.date}</span>
                            </div>
                            <div style={styles.tags}>
                                {question.tags.map(tag => (
                                    <span key={tag} style={styles.tag}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <button style={styles.askButton}>
                Ask Question
            </button>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        margin: '20px 0'
    },
    tab: {
        padding: '8px 16px',
        border: '1px solid #ddd',
        background: 'none',
        cursor: 'pointer',
        borderRadius: '4px'
    },
    activeTab: {
        padding: '8px 16px',
        border: '1px solid #1890ff',
        background: '#e6f7ff',
        color: '#1890ff',
        cursor: 'pointer',
        borderRadius: '4px'
    },
    questions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    question: {
        display: 'flex',
        gap: '20px',
        padding: '15px',
        border: '1px solid #eee',
        borderRadius: '5px',
        backgroundColor: '#fff'
    },
    votes: {
        textAlign: 'center',
        minWidth: '60px'
    },
    answers: {
        textAlign: 'center',
        minWidth: '60px'
    },
    content: {
        flex: 1
    },
    title: {
        margin: '0 0 10px 0',
        fontSize: '16px',
        color: '#1890ff'
    },
    meta: {
        display: 'flex',
        justifyContent: 'space-between',
        color: '#666',
        fontSize: '12px',
        marginBottom: '10px'
    },
    tags: {
        display: 'flex',
        gap: '5px',
        flexWrap: 'wrap'
    },
    tag: {
        backgroundColor: '#e6f7ff',
        color: '#1890ff',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '12px'
    },
    askButton: {
        marginTop: '20px',
        padding: '8px 16px',
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        float: 'right'
    }
};

export default QnA;
