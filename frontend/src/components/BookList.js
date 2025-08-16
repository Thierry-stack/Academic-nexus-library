// src/components/BookList.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const BookList = () => {
    const { token } = useContext(AuthContext);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/books', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBooks(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching books:', err);
                setError('Failed to load books. Please try again later.');
                setLoading(false);
            }
        };

        if (token) {
            fetchBooks();
        }
    }, [token]);

    if (loading) {
        return <div className="p-4 text-center">Loading books...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500 font-bold">{error}</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Books in the Library</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.length > 0 ? (
                    books.map((book) => (
                        <div key={book._id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            {book.cover_image_url ? (
                                <img
                                    // This is the crucial line: it prepends the backend URL
                                    src={`http://localhost:5000${book.cover_image_url}`}
                                    alt={`Cover for ${book.title}`}
                                    className="w-full h-48 object-cover"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                                    No cover image
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-800">{book.title}</h3>
                                <p className="text-sm text-gray-600">by {book.author}</p>
                                <p className="text-xs text-gray-500 mt-2">ISBN: {book.isbn}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 mt-10">
                        No books found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookList;