/**
 * Script to test the proxy API route for the over-ons page
 * This demonstrates the data structure received through the proxy
 */

const fetch = require('node-fetch');
require('dotenv').config();

async function testOverOnsProxy() {
  try {
    // Get environment variables
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000`;

    // Add cache buster to prevent any browser caching
    const cacheBuster = `_=${Date.now()}`;
    
    // Construct the URL for the over-ons page using the proxy
    const url = `${baseUrl}/api/proxy/pages?filters[slug][$eq]=over-ons&populate=*&${cacheBuster}`;
    
    console.log(`Making proxy API request to: ${url}`);
    
    // Make the request
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      return;
    }

    // Parse the response
    const data = await response.json();
    
    // Display the data structure
    console.log('\n=== OVER-ONS PAGE DATA STRUCTURE (VIA PROXY) ===\n');
    console.log('Data received:', {
      dataExists: !!data,
      hasData: !!data?.data,
      dataCount: data?.data?.length || 0,
      meta: data?.meta,
      firstItemId: data?.data?.[0]?.id || 'none',
      hasAttributes: !!data?.data?.[0]?.attributes,
      hasLayout: Array.isArray(data?.data?.[0]?.attributes?.layout),
      layoutCount: Array.isArray(data?.data?.[0]?.attributes?.layout) ? data.data[0].attributes.layout.length : 0
    });
    
    // Display the page data
    if (data?.data?.[0]) {
      const page = data.data[0];
      console.log('\n=== PAGE METADATA ===\n');
      console.log({
        id: page.id,
        title: page.attributes?.title,
        slug: page.attributes?.slug,
        createdAt: page.attributes?.createdAt,
        updatedAt: page.attributes?.updatedAt,
        publishedAt: page.attributes?.publishedAt,
        seoTitle: page.attributes?.seoTitle,
        seoDescription: page.attributes?.seoDescription,
        seoKeywords: page.attributes?.seoKeywords
      });
      
      // Display layout components
      if (Array.isArray(page.attributes?.layout)) {
        console.log('\n=== LAYOUT COMPONENTS ===\n');
        page.attributes.layout.forEach((component, index) => {
          console.log(`Component ${index + 1}:`);
          console.log({
            id: component.id,
            __component: component.__component,
            componentType: component.__component?.split('.')[1] || 'unknown',
            hasFeatures: component.__component?.includes('feature-grid') ? 
              (Array.isArray(component.features) ? `Yes (${component.features.length} features)` : 'No') : 'N/A'
          });
          
          // If it's a feature grid, show the features
          if (component.__component?.includes('feature-grid') && Array.isArray(component.features)) {
            console.log('\n  Features:');
            component.features.forEach((feature, featureIndex) => {
              console.log(`  Feature ${featureIndex + 1}:`, {
                id: feature.id,
                title: feature.title,
                description: feature.description ? `${feature.description.substring(0, 50)}...` : 'None',
                hasIcon: !!feature.icon
              });
            });
          }
          
          console.log('\n');
        });
      } else {
        console.log('No layout components found');
      }
    } else {
      console.log('No page data found');
    }
    
    console.log('\n=== RAW DATA ===\n');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing over-ons proxy API:', error);
  }
}

// Run the test
testOverOnsProxy();