const axios = require('axios');

// Replace with your actual API key
const API_KEY = 'hf_test_key_12345678901234567890abcdef'; // Using fake key with proper format

// Make a request to the backend to test the API
async function testAPI() {
  try {
    console.log('Making API call to test endpoint...');
    
    const response = await axios.post('http://localhost:3001/api/analysis/test-key', {
      apiKey: API_KEY,
      model: 'gpt2'
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
