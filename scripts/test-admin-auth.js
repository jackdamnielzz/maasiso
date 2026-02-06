// Test admin auth endpoint on production
const BASE_URL = process.env.BASE_URL || 'https://www.maasiso.nl';
const PASSWORD = '[REDACTED_PASSWORD]';

async function testAuth() {
  console.log(`Testing auth at ${BASE_URL}/api/admin-auth`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: PASSWORD })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Authentication successful!');
    } else {
      console.log('❌ Authentication failed:', data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();

