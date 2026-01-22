/**
 * Script to test the direct Strapi API call for the over-ons page
 * This demonstrates the data structure received from Strapi
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.production' });

async function testOverOnsApi() {
  try {
    // Get environment variables
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    // Debug environment variables
    console.log('Environment Variables:');
    console.log('STRAPI_URL:', process.env.STRAPI_URL);
    console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log('Using Strapi URL:', strapiUrl);
    console.log('Token available:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Token prefix:', token ? token.substring(0, 10) + '...' : 'N/A');

    if (!strapiUrl || !token) {
      console.error('Missing Strapi URL or token in environment variables');
      return;
    }

    // Add cache buster to prevent any browser caching
    const cacheBuster = `_=${Date.now()}`;
    
    // Simplified populate parameters to avoid deep nesting issues
    const enhancedPopulate = [
      'populate[0]=layout',
      'populate[1]=layout.features',
      'populate[2]=layout.features.icon'
    ].join('&');
    
    // Construct the URL for the over-ons page
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=over-ons&${enhancedPopulate}&${cacheBuster}`;
    
    console.log(`Making direct Strapi API request to: ${url}`);
    
    // Make the request
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
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
    console.log('\n=== OVER-ONS PAGE DATA STRUCTURE ===\n');
    console.log('Data received:', {
      dataExists: !!data,
      hasData: !!data?.data,
      dataCount: data?.data?.length || 0,
      meta: data?.meta,
      firstItemId: data?.data?.[0]?.id || 'none',
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
    console.error('Error testing over-ons API:', error);
  }
}

// Run the test
testOverOnsApi();