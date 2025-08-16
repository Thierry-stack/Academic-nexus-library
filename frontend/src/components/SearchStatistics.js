// src/components/SearchStatistics.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';

const SearchStatistics = () => {
    const { token } = useContext(AuthContext);
    const [searchStats, setSearchStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use useCallback to memoize the function
    const fetchSearchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/search-stats/most-searched', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch search statistics');
            }

            const data = await response.json();
            setSearchStats(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching search statistics:', err);
            setError(err.message || 'Failed to load search statistics');
        } finally {
            setLoading(false);
        }
    }, [token]); // Add token as a dependency for the useCallback hook

    useEffect(() => {
        if (token) {
            fetchSearchStats();
        } else {
            setLoading(false);
            setError('Authentication token is missing. Please log in.');
        }
    }, [token, fetchSearchStats]); // Now the dependency array is complete

    const handleClearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/search-stats/clear-history', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to clear search history');
            }
            
            fetchSearchStats();
            
            alert('Search history has been cleared successfully.');
        } catch (err) {
            console.error('Error clearing search history:', err);
            setError(err.message || 'Failed to clear search history');
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Loading search statistics...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500 font-bold">{error}</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Most Searched Books</h2>
                <button
                    onClick={handleClearHistory}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
                >
                    Clear Search History
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Book Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Search Count
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Searched
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {searchStats.length > 0 ? (
                            searchStats.map((book, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {book.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {book.search_count} searches
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(book.last_searched_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No search data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SearchStatistics;