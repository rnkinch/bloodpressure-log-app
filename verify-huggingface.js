const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function verifyHuggingFaceAPI() {
  try {
    // Get API key from user
    const apiKey = await new Promise(resolve => {
      rl.question('Enter your HuggingFace API key: ', answer => {
        console.log('Using API key:', answer.substring(0, 5) + '...');
        resolve(answer);
      });
    });
    
    // Get model from user (or use default)
    const model = await new Promise(resolve => {
      rl.question('Enter model name (default: gpt2): ', answer => {
        const modelName = answer.trim() || 'gpt2';
        console.log('Using model:', modelName);
        resolve(modelName);
      });
    });
    
    // Get test text from user (or use default)
    const text = await new Promise(resolve => {
      rl.question('Enter test text (default: Hello, world!): ', answer => {
        const testText = answer.trim() || 'Hello, world!';
        console.log('Using text:', testText);
        resolve(testText);
      });
    });
    
    console.log('\n--- Making direct API call to HuggingFace ---');
    console.log(`API: https://api-inference.huggingface.co/models/${model}`);
    
    const startTime = Date.now();
    
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: text },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    const endTime = Date.now();
    
    console.log('\n--- HuggingFace API Response ---');
    console.log(`Status: ${response.status}`);
    console.log(`Time: ${endTime - startTime}ms`);
    console.log(`X-Request-ID: ${response.headers['x-request-id'] || 'not present'}`);
    console.log(`X-Compute-Type: ${response.headers['x-compute-type'] || 'not present'}`);
    console.log(`X-Compute-Time: ${response.headers['x-compute-time'] || 'not present'}`);
    console.log('\nResponse data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n✅ SUCCESS: HuggingFace API call was successful!');
    console.log('This confirms your API key is working and you should see this activity in your HuggingFace account metrics.');
    
  } catch (error) {
    console.error('\n❌ ERROR: HuggingFace API call failed');
    console.error(`Error message: ${error.message}`);
    
    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      console.error(`Status text: ${error.response.statusText}`);
      console.error('Response data:', error.response.data);
    }
    
    if (error.response && error.response.status === 401) {
      console.error('\nAuthentication failed. Please check your API key.');
    } else if (error.response && error.response.status === 404) {
      console.error('\nModel not found. Please check the model name.');
    }
  } finally {
    rl.close();
  }
}

// Run the verification
verifyHuggingFaceAPI();
