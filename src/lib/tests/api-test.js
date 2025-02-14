// Simple API test script
const fetch = require('node-fetch');

async function testApiConnection() {
  console.log('Testing API connection...');
  
  const API_URL = 'http://153.92.223.23:1337';
  const API_TOKEN = 'cff7eeae750583ce173da8532bcc487b945174d088f405f95ebc9a3a8f34c43c6897ea290d39c3048ce97be337b256b703b77cef106f71dc2578d10fe7f8acf4a662cb8dc1ea20bc67f4fa5939beeb0032ef4deecda0d82780f8b565af7170128f46f6c03a16010d7e5f2ead7e9d2109adfde2152a85f2ee45d800ac596c80ec';

  try {
    // First test basic connectivity
    console.log('Testing basic connectivity...');
    const healthResponse = await fetch(`${API_URL}/api/health`);
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      console.log('Health check successful');
    } else {
      console.log('Health check failed');
      const healthData = await healthResponse.text();
      console.log('Health check response:', healthData);
    }
    
    // Then test authenticated endpoint
    console.log('\nTesting authenticated endpoint...');
    const response = await fetch(`${API_URL}/api/pages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response Data:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('API Error Response:', errorData);
    }
    
    return response.ok;
  } catch (error) {
    console.error('API Connection Error:', error);
    return false;
  }
}

// Run the test
testApiConnection().then(success => {
  console.log('\nAPI Connection Test:', success ? 'SUCCESS' : 'FAILED');
  process.exit(success ? 0 : 1);
});
