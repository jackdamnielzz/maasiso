const fs = require('fs');
const path = require('path');
const https = require('https');

// Build verification script
async function verifyBuild() {
  console.log('🔍 Verifying production build...');
  const errors = [];
  const warnings = [];

  try {
    // Check for .next directory
    if (!fs.existsSync(path.join(process.cwd(), '.next'))) {
      errors.push('Production build (.next directory) not found. Run npm run build:prod first.');
    }

    // Check for required files
    const requiredFiles = [
      '.env.production',
      'next.config.js',
      'server.js',
      'package.json'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(process.cwd(), 'frontend', file))) {
        errors.push(`Required file missing: ${file}`);
      }
    }

    // Verify .env.production
    const envContent = fs.readFileSync(path.join(process.cwd(), 'frontend', '.env.production'), 'utf8');
    const requiredEnvVars = [
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_STRAPI_TOKEN'
    ];

    for (const envVar of requiredEnvVars) {
      if (!envContent.includes(envVar)) {
        errors.push(`Missing required environment variable: ${envVar}`);
      }
    }

    // Check API endpoints
    const apiUrl = envContent.match(/NEXT_PUBLIC_API_URL=(.*)/)?.[1]?.trim();
    if (apiUrl) {
      try {
        await checkEndpoint(apiUrl);
        console.log('✅ API endpoint is accessible');
      } catch (error) {
        warnings.push(`API endpoint (${apiUrl}) is not accessible: ${error.message}`);
      }
    }

    // Check package.json
    const packageJson = require(path.join(process.cwd(), 'frontend', 'package.json'));
    if (!packageJson.scripts?.start) {
      errors.push('Missing start script in package.json');
    }

    // Verify next.config.js
    const nextConfig = require(path.join(process.cwd(), 'frontend', 'next.config.js'));
    if (!nextConfig.output === 'standalone') {
      warnings.push('next.config.js: output is not set to standalone');
    }

    // Report results
    console.log('\n📋 Verification Results:');
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    if (warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log('\n✨ All checks passed! Build is ready for deployment.');
    } else if (errors.length === 0) {
      console.log('\n🟡 Build has warnings but can be deployed.');
    } else {
      console.log('\n❌ Build verification failed. Please fix errors before deploying.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  }
}

// Helper function to check if an endpoint is accessible
function checkEndpoint(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 5000 }, (response) => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        resolve();
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

verifyBuild();
