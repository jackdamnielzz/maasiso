# Content Dynamic Loading Implementation

## Overview

This document details the implementation of dynamic content loading for the MaasISO website, focusing on ensuring that all content is fetched from Strapi rather than being hardcoded in the frontend.

## Implementation Details

### Page Structure

Each page in the MaasISO website follows a consistent pattern for content loading:

1. **Content Fetching**: Pages use the `getPage` function from `src/lib/api.ts` to fetch content from Strapi based on the page slug.
2. **Dynamic Rendering**: Pages use `dynamic = 'force-dynamic'` and `revalidate = 0` to ensure they are always rendered dynamically and display the most up-to-date content.
3. **Content Validation**: Pages check if the fetched content is valid before rendering it.
4. **Error Handling**: Pages display a minimal error message when Strapi content is unavailable.

### Content Components

The following components are used to display content fetched from Strapi:

1. **Hero Component**: Displays a hero section with title, subtitle, and optional CTA button.
2. **Text Block Component**: Displays formatted text content.
3. **Feature Grid Component**: Displays a grid of features with icons, titles, and descriptions.
4. **Button Component**: Displays a call-to-action button with title and description.

### Error Handling

When Strapi content is unavailable, pages display a minimal error message:

```jsx
<main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
  <section className="py-16 md:py-24">
    <div className="container-custom px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
        <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
        <div className="p-8 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#091E42]">
            Page Title
          </h2>
          <p className="text-gray-600 mb-4">
            De inhoud van deze pagina wordt geladen vanuit het Content Management Systeem (Strapi).
          </p>
          <p className="text-gray-600">
            Neem contact op met de beheerder als deze melding blijft bestaan.
          </p>
        </div>
      </div>
    </div>
  </section>
</main>
```

### Minimal Fallbacks

Some components include minimal fallbacks for edge cases where specific properties might be missing from Strapi:

1. **Feature Grid Title**: `{block.title || 'Onze Expertise'}`
2. **Feature Description**: `{feature.description || `Wij bieden professionele begeleiding en advies voor ${feature.title}.`}`
3. **Button Title**: `{block.title || 'Klaar om uw organisatie naar een hoger niveau te tillen?'}`
4. **Button Description**: `{block.description || 'Neem contact op voor een vrijblijvend gesprek over hoe MaasISO u kan helpen met ISO-certificering en informatiebeveiliging.'}`

These fallbacks are minimal and only used when specific properties are missing, not as a replacement for entire components.

## Testing

A test script has been created to verify that pages are correctly fetching and displaying content from Strapi:

```javascript
// scripts/test-content-dynamic.js
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

// Test pages for dynamic content loading
const testPage = async (page) => {
  // Fetch page HTML
  const html = await fetchHtml(`${BASE_URL}${page.path}`);
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Check if dynamic content is rendered
  const dynamicContent = document.querySelector(`[data-testid="${page.testId}"]`);
  const fallbackContent = document.querySelector(`[data-testid="${page.fallbackTestId}"]`);
  
  // Fetch Strapi content for comparison
  const strapiContent = await fetchStrapiContent(page.strapiSlug);
  
  // Verify that the page is displaying the correct content
  if (strapiContent.data && strapiContent.data.length > 0) {
    if (dynamicContent) {
      console.log(`✅ SUCCESS: Page ${page.path} is correctly displaying dynamic content from Strapi`);
    } else {
      console.log(`❌ ERROR: Page ${page.path} is not showing dynamic content despite Strapi data being available`);
    }
  } else {
    if (fallbackContent) {
      console.log(`✅ SUCCESS: Page ${page.path} is correctly showing fallback content when Strapi data is unavailable`);
    } else {
      console.log(`❌ ERROR: Page ${page.path} is not showing fallback content despite Strapi data being unavailable`);
    }
  }
};
```

## Implementation Steps

The following steps were taken to implement dynamic content loading:

1. **Audit Existing Pages**: Identified hardcoded content in the diensten and over-ons pages.
2. **Remove Hardcoded Content**: Removed extensive hardcoded content from both pages.
3. **Implement Error Handling**: Added consistent error handling for cases when Strapi data cannot be fetched.
4. **Add Data Attributes**: Added data-testid attributes to facilitate testing.
5. **Create Test Script**: Created a script to verify that pages are correctly fetching and displaying content from Strapi.
6. **Document Changes**: Created documentation to explain the implementation and testing process.

## Conclusion

The diensten and over-ons pages now follow a consistent pattern for content loading, ensuring that all content is fetched from Strapi rather than being hardcoded in the frontend. This approach provides several benefits:

1. **Content Management**: Content can be managed through Strapi without requiring code changes.
2. **Consistency**: All pages follow the same pattern for content loading.
3. **Error Handling**: Pages handle API failures gracefully.
4. **Testing**: The implementation can be verified through automated tests.

This implementation aligns with the project's goal of using Strapi as the primary content management system for the MaasISO website.