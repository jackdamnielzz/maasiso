/**
 * Environment configuration test script
 * Run this to verify environment variables are loaded correctly
 */

import { env } from './env';

function testEnvironmentVariables() {
  console.log('\nTesting Environment Configuration\n');
  console.log('=================================');

  // Test required variables
  const requiredVars = [
    'apiUrl',
    'siteUrl',
    'graphqlUrl',
    'authSecret',
    'strapiToken'
  ];

  console.log('\nRequired Variables:');
  console.log('-----------------');
  requiredVars.forEach(varName => {
    const value = env[varName as keyof typeof env];
    const status = value ? '✓' : '✗';
    console.log(`${status} ${varName}: ${value ? 'Present' : 'Missing'}`);
  });

  // Test URL formats
  console.log('\nURL Validation:');
  console.log('--------------');
  ['apiUrl', 'siteUrl', 'graphqlUrl'].forEach(urlVar => {
    const url = env[urlVar as 'apiUrl' | 'siteUrl' | 'graphqlUrl'];
    let status = '✓';
    let message = 'Valid URL format';
    
    try {
      new URL(url);
    } catch {
      status = '✗';
      message = 'Invalid URL format';
    }
    
    console.log(`${status} ${urlVar}: ${message}`);
  });

  // Test feature flags
  console.log('\nFeature Flags:');
  console.log('--------------');
  console.log(`Blog enabled: ${env.enableBlog}`);
  console.log(`Tools enabled: ${env.enableTools}`);

  // Test debug mode
  console.log('\nDebug Configuration:');
  console.log('------------------');
  console.log(`Debug mode: ${env.debug}`);
  console.log(`Node environment: ${process.env.NODE_ENV}`);

  console.log('\n=================================\n');
}

// Run tests if this file is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  testEnvironmentVariables();
}

export { testEnvironmentVariables };
