/**
 * Content Dynamic Loading Test Script
 * 
 * This script tests whether the diensten and over-ons pages are correctly
 * fetching content from Strapi and displaying it dynamically.
 * 
 * Usage:
 * node scripts/test-content-dynamic.js
 */

const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const STRAPI_URL = process.env.STRAPI_URL || 'http://153.92.223.23:1337';
const PAGES_TO_TEST = [
  { 
    path: '/diensten', 
    strapiSlug: 'diensten',
    testId: 'diensten-dynamic-content',
    fallbackTestId: 'diensten-fallback-content'
  },
  { 
    path: '/over-ons', 
    strapiSlug: 'over-ons',
    testId: 'over-ons-dynamic-content',
    fallbackTestId: 'over-ons-static-content'
  }
];

// Utility functions
const fetchHtml = async (url) => {
  console.log(`Fetching HTML from ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return await response.text();
};

const fetchStrapiContent = async (slug) => {
  console.log(`Fetching Strapi content for ${slug}...`);
  const url = `${STRAPI_URL}/api/pages?filters[slug][$eq]=${slug}&populate=*`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Strapi content for ${slug}: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};

const testPage = async (page) => {
  console.log(`\n=== Testing ${page.path} ===`);
  
  try {
    // Fetch page HTML
    const html = await fetchHtml(`${BASE_URL}${page.path}`);
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Check if dynamic content is rendered
    const dynamicContent = document.querySelector(`[data-testid="${page.testId}"]`);
    const fallbackContent = document.querySelector(`[data-testid="${page.fallbackTestId}"]`);
    
    console.log(`Dynamic content element found: ${!!dynamicContent}`);
    console.log(`Fallback content element found: ${!!fallbackContent}`);
    
    // Fetch Strapi content for comparison
    let strapiContent;
    try {
      strapiContent = await fetchStrapiContent(page.strapiSlug);
      console.log(`Strapi content available: ${!!strapiContent.data && strapiContent.data.length > 0}`);
      
      // If Strapi content is available, dynamic content should be rendered
      if (strapiContent.data && strapiContent.data.length > 0) {
        if (dynamicContent) {
          console.log(`✅ SUCCESS: Page ${page.path} is correctly displaying dynamic content from Strapi`);
          
          // Additional verification: Check if feature grid is rendered if it exists in Strapi data
          const hasFeatureGrid = strapiContent.data[0].attributes.layout?.some(
            item => item.__component === 'page-blocks.feature-grid'
          );
          
          if (hasFeatureGrid) {
            const featureGrid = document.querySelector('[data-testid="service-cards-grid"]');
            console.log(`Feature grid should be present: ${hasFeatureGrid}`);
            console.log(`Feature grid element found: ${!!featureGrid}`);
            
            if (featureGrid) {
              const featureCards = featureGrid.querySelectorAll('[data-testid^="service-card-"]');
              console.log(`Number of feature cards found: ${featureCards.length}`);
            }
          }
        } else if (fallbackContent) {
          console.log(`❌ ERROR: Page ${page.path} is showing fallback content despite Strapi data being available`);
        } else {
          console.log(`❌ ERROR: Page ${page.path} is not showing any recognized content`);
        }
      } 
      // If Strapi content is not available, fallback content should be rendered
      else {
        if (fallbackContent) {
          console.log(`✅ SUCCESS: Page ${page.path} is correctly showing fallback content when Strapi data is unavailable`);
        } else if (dynamicContent) {
          console.log(`❌ ERROR: Page ${page.path} is showing dynamic content despite Strapi data being unavailable`);
        } else {
          console.log(`❌ ERROR: Page ${page.path} is not showing any recognized content`);
        }
      }
    } catch (strapiError) {
      console.error(`Failed to fetch Strapi content: ${strapiError.message}`);
      
      // If Strapi is unreachable, fallback content should be rendered
      if (fallbackContent) {
        console.log(`✅ SUCCESS: Page ${page.path} is correctly showing fallback content when Strapi is unreachable`);
      } else if (dynamicContent) {
        console.log(`❌ ERROR: Page ${page.path} is showing dynamic content despite Strapi being unreachable`);
      } else {
        console.log(`❌ ERROR: Page ${page.path} is not showing any recognized content`);
      }
    }
  } catch (error) {
    console.error(`Failed to test ${page.path}: ${error.message}`);
  }
};

// Main function
const runTests = async () => {
  console.log('Starting content dynamic loading tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Strapi URL: ${STRAPI_URL}`);
  
  for (const page of PAGES_TO_TEST) {
    await testPage(page);
  }
  
  console.log('\nTests completed.');
};

// Run the tests
runTests().catch(error => {
  console.error('Test script failed:', error);
  process.exit(1);
});