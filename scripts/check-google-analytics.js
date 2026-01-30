/**
 * Google Analytics & Tag Manager Verification Script
 * 
 * This script checks the configuration of GTM and GA4 using the Google APIs.
 * Run with: node scripts/check-google-analytics.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const GTM_ACCOUNT_ID = '6228851648'; // Update this with your GTM account ID
const GTM_CONTAINER_ID = '198212851'; // Update this - the numeric ID, not GTM-556J8S8K
const GA4_PROPERTY_ID = ''; // We'll discover this

// Load service account credentials
const CREDENTIALS_PATH = path.join(__dirname, '..', 'secrets', 'google-service-account.json');

async function getAuthClient() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/tagmanager.readonly',
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics.edit',
    ],
  });
  
  return auth;
}

async function checkGTM(auth) {
  console.log('\n========== Google Tag Manager ==========\n');
  
  try {
    const tagmanager = google.tagmanager({ version: 'v2', auth });
    
    // List all accounts
    console.log('📋 Listing GTM Accounts...');
    const accountsResponse = await tagmanager.accounts.list();
    const accounts = accountsResponse.data.account || [];
    
    if (accounts.length === 0) {
      console.log('❌ No GTM accounts found. Check if the service account has access.');
      return;
    }
    
    console.log(`✅ Found ${accounts.length} GTM account(s):\n`);
    
    for (const account of accounts) {
      console.log(`  Account: ${account.name}`);
      console.log(`  Account ID: ${account.accountId}`);
      console.log(`  Path: ${account.path}`);
      
      // List containers in this account
      const containersResponse = await tagmanager.accounts.containers.list({
        parent: account.path,
      });
      const containers = containersResponse.data.container || [];
      
      console.log(`\n  📦 Containers in this account:`);
      for (const container of containers) {
        console.log(`    - ${container.name} (${container.publicId})`);
        console.log(`      Container ID: ${container.containerId}`);
        console.log(`      Domain: ${container.domainName?.join(', ') || 'Not set'}`);
        
        // Check if this is the MaasISO container
        if (container.publicId === 'GTM-556J8S8K') {
          console.log('\n  🎯 Found MaasISO Container! Checking tags...\n');
          
          // List workspaces
          const workspacesResponse = await tagmanager.accounts.containers.workspaces.list({
            parent: container.path,
          });
          const workspaces = workspacesResponse.data.workspace || [];
          const defaultWorkspace = workspaces.find(w => w.name === 'Default Workspace') || workspaces[0];
          
          if (defaultWorkspace) {
            // List tags
            const tagsResponse = await tagmanager.accounts.containers.workspaces.tags.list({
              parent: defaultWorkspace.path,
            });
            const tags = tagsResponse.data.tag || [];
            
            console.log(`  🏷️  Tags in workspace "${defaultWorkspace.name}":`);
            if (tags.length === 0) {
              console.log('    ⚠️  No tags found! You need to create GA4 configuration tag.');
            } else {
              for (const tag of tags) {
                console.log(`    - ${tag.name} (${tag.type})`);
                
                // Check for GA4 configuration
                if (tag.type === 'gaawc' || tag.type === 'gaawe') {
                  console.log(`      ✅ GA4 tag found!`);
                  // Try to find measurement ID
                  const measurementIdParam = tag.parameter?.find(p => p.key === 'measurementId');
                  if (measurementIdParam) {
                    console.log(`      Measurement ID: ${measurementIdParam.value}`);
                  }
                }
              }
            }
            
            // List triggers
            const triggersResponse = await tagmanager.accounts.containers.workspaces.triggers.list({
              parent: defaultWorkspace.path,
            });
            const triggers = triggersResponse.data.trigger || [];
            
            console.log(`\n  ⚡ Triggers:`);
            for (const trigger of triggers) {
              console.log(`    - ${trigger.name} (${trigger.type})`);
            }
            
            // List variables
            const variablesResponse = await tagmanager.accounts.containers.workspaces.variables.list({
              parent: defaultWorkspace.path,
            });
            const variables = variablesResponse.data.variable || [];
            
            console.log(`\n  📐 Variables: ${variables.length} defined`);
          }
        }
      }
      console.log('\n');
    }
  } catch (error) {
    if (error.code === 403) {
      console.log('❌ Permission denied. Make sure the service account has access to GTM.');
      console.log('   Go to tagmanager.google.com → Admin → User Management → Add the service account email');
    } else if (error.code === 404) {
      console.log('❌ GTM API might not be enabled.');
      console.log('   Go to console.cloud.google.com → APIs & Services → Enable "Tag Manager API"');
    } else {
      console.log('❌ Error accessing GTM:', error.message);
    }
  }
}

async function checkGA4(auth) {
  console.log('\n========== Google Analytics 4 ==========\n');
  
  try {
    const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth });
    
    // List all accounts
    console.log('📋 Listing GA4 Accounts...');
    const accountsResponse = await analyticsAdmin.accounts.list();
    const accounts = accountsResponse.data.accounts || [];
    
    if (accounts.length === 0) {
      console.log('❌ No GA4 accounts found. Check if the service account has access.');
      return;
    }
    
    console.log(`✅ Found ${accounts.length} GA4 account(s):\n`);
    
    for (const account of accounts) {
      console.log(`  Account: ${account.displayName}`);
      console.log(`  Account ID: ${account.name}`);
      
      // List properties in this account
      const propertiesResponse = await analyticsAdmin.properties.list({
        filter: `parent:${account.name}`,
      });
      const properties = propertiesResponse.data.properties || [];
      
      console.log(`\n  📊 Properties in this account:`);
      for (const property of properties) {
        console.log(`    - ${property.displayName}`);
        console.log(`      Property ID: ${property.name}`);
        console.log(`      Time Zone: ${property.timeZone}`);
        console.log(`      Currency: ${property.currencyCode}`);
        console.log(`      Industry: ${property.industryCategory || 'Not set'}`);
        
        // Check if this might be MaasISO
        if (property.displayName?.toLowerCase().includes('maas') || 
            property.displayName?.toLowerCase().includes('iso')) {
          console.log('\n    🎯 This might be the MaasISO property!');
          
          // Get data streams
          const streamsResponse = await analyticsAdmin.properties.dataStreams.list({
            parent: property.name,
          });
          const streams = streamsResponse.data.dataStreams || [];
          
          console.log(`\n    🌊 Data Streams:`);
          for (const stream of streams) {
            console.log(`      - ${stream.displayName}`);
            console.log(`        Type: ${stream.type}`);
            if (stream.webStreamData) {
              console.log(`        Measurement ID: ${stream.webStreamData.measurementId}`);
              console.log(`        Default URI: ${stream.webStreamData.defaultUri}`);
            }
          }
        }
      }
      console.log('\n');
    }
  } catch (error) {
    if (error.code === 403) {
      console.log('❌ Permission denied. Make sure the service account has access to GA4.');
      console.log('   Go to analytics.google.com → Admin → Property Access Management → Add the service account email');
    } else if (error.code === 404) {
      console.log('❌ Google Analytics Admin API might not be enabled.');
      console.log('   Go to console.cloud.google.com → APIs & Services → Enable "Google Analytics Admin API"');
    } else {
      console.log('❌ Error accessing GA4:', error.message);
    }
  }
}

async function main() {
  console.log('🔍 Google Analytics & Tag Manager Verification');
  console.log('================================================\n');
  
  // Check if credentials file exists
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.log('❌ Credentials file not found at:', CREDENTIALS_PATH);
    console.log('   Please add the service account JSON key to secrets/google-service-account.json');
    process.exit(1);
  }
  
  console.log('✅ Credentials file found');
  
  // Get authenticated client
  const auth = await getAuthClient();
  console.log('✅ Authentication successful\n');
  
  // Check GTM
  await checkGTM(auth);
  
  // Check GA4
  await checkGA4(auth);
  
  console.log('\n================================================');
  console.log('Verification complete!');
}

main().catch(console.error);
