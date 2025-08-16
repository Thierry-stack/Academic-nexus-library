require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSearchStats() {
    try {
        console.log('🚀 Testing search statistics...');
        
        // Test 1: Get most searched books (should return empty array or existing searches)
        console.log('\n📊 Testing GET /search-stats/most-searched...');
        const response1 = await axios.get(`${BASE_URL}/search-stats/most-searched`);
        console.log('✅ Success! Response:', {
            status: response1.status,
            data: response1.data
        });

        // Test 2: Track a search
        console.log('\n🔍 Testing POST /search-stats/track-search...');
        const testBook = `Test Book ${Date.now()}`;
        const response2 = await axios.post(`${BASE_URL}/search-stats/track-search`, {
            title: testBook
        });
        console.log('✅ Success! Response:', {
            status: response2.status,
            data: response2.data
        });

        // Test 3: Verify the search was tracked
        console.log('\n🔍 Verifying the search was tracked...');
        const response3 = await axios.get(`${BASE_URL}/search-stats/most-searched`);
        const found = response3.data.some(book => book.title === testBook);
        
        if (found) {
            console.log('✅ Success! Test book was found in search results');
        } else {
            console.log('❌ Test book was not found in search results');
            console.log('Search results:', response3.data);
        }

        console.log('\n✨ All tests completed!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        
        process.exit(1);
    }
}

testSearchStats();
