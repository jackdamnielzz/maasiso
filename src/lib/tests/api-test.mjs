// Simple API test script
import fetch from 'node-fetch';

async function testApiConnection() {
  console.log('Testing API connection...');
  
  const API_URL = 'http://153.92.223.23:1337';
  const API_TOKEN = 'cff7eeae750583ce173da8532bcc487b945174d088f405f95ebc9a3a8f34c43c6897ea290d39c3048ce97be337b256b703b77cef106f71dc2578d10fe7f8acf4a662cb8dc1ea20bc67f4fa5939beeb0032ef4deecda0d82780f8b565af7170128f46f6c03a16010d7e5f2ead7e9d2109adfde2152a85f2ee45d800ac596c80ec';

  try {
    // Test server status
    console.log('Testing server status...');
    const serverResponse = await fetch(API_URL);
    console.log('Server status:', serverResponse.status);
    
    if (serverResponse.ok) {
      console.log('Server is responding');
    } else {
      console.log('Server not responding properly');
      const errorData = await serverResponse.text();
      console.log('Server error:', errorData);
    }
    
    // Test blog posts endpoint
    console.log('\nTesting blog posts endpoint...');
    const blogResponse = await fetch(`${API_URL}/api/blog-posts?populate=*`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Blog Posts Response Status:', blogResponse.status);
    
    if (blogResponse.ok) {
      const data = await blogResponse.json();
      console.log('Blog Posts Data:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await blogResponse.text();
      console.log('Blog Posts Error Response:', errorData);
    }

    // Test categories endpoint
    console.log('\nTesting categories endpoint...');
    const categoriesResponse = await fetch(`${API_URL}/api/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Categories Response Status:', categoriesResponse.status);
    
    if (categoriesResponse.ok) {
      const data = await categoriesResponse.json();
      console.log('Categories Data:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await categoriesResponse.text();
      console.log('Categories Error Response:', errorData);
    }
    
    return blogResponse.ok || categoriesResponse.ok;
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
