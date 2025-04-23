const identifyNextjsPages = require('./identifyPages');

describe('identifyNextjsPages', () => {
  // Test Case 1: Basic static and dynamic pages including root
  test('should correctly identify root, static, and basic dynamic pages', () => {
    const fileList = `
app/page.tsx
app/about/page.tsx
app/blog/[slug]/page.tsx
app/layout.tsx
app/api/route.js
`;
    const expected = [
      { path: '/', type: 'static' },
      { path: '/about', type: 'static' },
      { path: '/blog/[slug]', type: 'dynamic' },
    ];
    expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
    expect(identifyNextjsPages(fileList).length).toBe(expected.length);
  });

  // Test Case 2: Nested static and dynamic pages with different extensions
  test('should correctly identify nested static and dynamic pages with various extensions', () => {
    const fileList = `
app/products/page.jsx
app/products/[category]/page.js
app/products/[category]/[productId]/page.tsx
app/services/consulting/page.tsx
`;
    const expected = [
      { path: '/products', type: 'static' },
      { path: '/products/[category]', type: 'dynamic' },
      { path: '/products/[category]/[productId]', type: 'dynamic' },
      { path: '/services/consulting', type: 'static' },
    ];
    expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
    expect(identifyNextjsPages(fileList).length).toBe(expected.length);
  });

  // Test Case 3: Mixed static and dynamic segments
  test('should handle routes with mixed static and dynamic segments', () => {
    const fileList = `
app/shop/[category]/overview/page.tsx
app/shop/[category]/item/[itemId]/page.js
`;
    const expected = [
      { path: '/shop/[category]/overview', type: 'dynamic' },
      { path: '/shop/[category]/item/[itemId]', type: 'dynamic' },
    ];
    expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
    expect(identifyNextjsPages(fileList).length).toBe(expected.length);
  });


  // Test Case 4: Empty input string
  test('should return an empty array for an empty input string', () => {
    const fileList = ``;
    const expected = [];
    expect(identifyNextjsPages(fileList)).toEqual(expected);
  });

  // Test Case 5: Input with only non-page files
  test('should return an empty array if only non-page files are present', () => {
    const fileList = `
app/layout.tsx
app/api/users/route.ts
app/components/Button.tsx
README.md
`;
    const expected = [];
    expect(identifyNextjsPages(fileList)).toEqual(expected);
  });

    // Test Case 6: Input with Windows-style paths (should still work if separators are consistent)
    // Note: The script uses replace(/^app\//, '') which is forward-slash specific.
    // This test assumes the input might have mixed separators but the core logic relies on finding '/page.tsx' etc.
    // A more robust implementation might normalize separators first.
    test('should handle mixed path separators if page suffix is correct', () => {
        const fileList = `app\\page.tsx\napp\\about\\page.jsx\napp\\blog\\[slug]/page.tsx`;
        const expected = [
          { path: '/', type: 'static' },        // Assumes replace removes 'app\' correctly due to regex nature
          { path: '/about', type: 'static' }, // Assumes replace works correctly on nested paths
          { path: '/blog/[slug]', type: 'dynamic' },
        ];
        // This expectation might be fragile depending on exact regex behavior with backslashes.
        // If this fails, it indicates a potential :CompatibilityIssue with Windows paths.
         expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
         expect(identifyNextjsPages(fileList).length).toBe(expected.length);
      });

    // Test Case 7: Input with extra whitespace
    test('should handle input with extra whitespace and blank lines', () => {
        const fileList = `

      app/page.tsx

   app/contact/page.js

      app/non-page.txt

`;
        const expected = [
          { path: '/', type: 'static' },
          { path: '/contact', type: 'static' },
        ];
        expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
        expect(identifyNextjsPages(fileList).length).toBe(expected.length);
      });



  // === Route Group Tests ===

  // Test Case 8: Basic static page inside a route group
  test('should correctly identify static page inside a route group', () => {
    const fileList = `
app/(marketing)/about/page.tsx
app/page.tsx
`;
    const expected = [
      { path: '/about', type: 'static' },
      { path: '/', type: 'static' },
    ];
    expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
    expect(identifyNextjsPages(fileList).length).toBe(expected.length);
  });

  // Test Case 9: Dynamic page inside a route group
  test('should correctly identify dynamic page inside a route group', () => {
    const fileList = `
app/(shop)/products/[id]/page.tsx
app/contact/page.js
`;
    const expected = [
      { path: '/products/[id]', type: 'dynamic' },
      { path: '/contact', type: 'static' },
    ];
    expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
    expect(identifyNextjsPages(fileList).length).toBe(expected.length);
  });

  // Test Case 10: Nested route groups
  test('should correctly identify page inside nested route groups', () => {
    const fileList = `
app/(main)/(legal)/privacy/page.tsx
`;
    const expected = [
      { path: '/privacy', type: 'static' },
    ];
    expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
    expect(identifyNextjsPages(fileList).length).toBe(expected.length);
  });

  // Test Case 11: Page directly within a route group at app root
  test('should correctly identify page directly within a route group at app root', () => {
    const fileList = `
app/(auth)/login/page.tsx
`;
    const expected = [
      { path: '/login', type: 'static' },
    ];
    expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
    expect(identifyNextjsPages(fileList).length).toBe(expected.length);
  });

  // Test Case 12: Root page within a route group
  test('should correctly identify root page within a route group', () => {
    const fileList = `
app/(marketing)/page.tsx
app/other/page.js
`;
    const expected = [
      { path: '/', type: 'static' },
      { path: '/other', type: 'static' },
    ];
    expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
    expect(identifyNextjsPages(fileList).length).toBe(expected.length);
  });

  // Test Case 13: Mixed route groups and regular paths
  test('should handle mix of route groups and regular paths', () => {
    const fileList = `
app/page.tsx
app/(marketing)/about/page.tsx
app/blog/[slug]/page.tsx
app/(shop)/products/[category]/[productId]/page.tsx
app/(shop)/cart/page.jsx
app/regular/path/page.js
`;
    const expected = [
       { path: '/', type: 'static' },
       { path: '/about', type: 'static' },
       { path: '/blog/[slug]', type: 'dynamic' },
       { path: '/products/[category]/[productId]', type: 'dynamic' },
       { path: '/cart', type: 'static' },
       { path: '/regular/path', type: 'static' },
    ];
    // Use arrayContaining because order isn't guaranteed by the function
    expect(identifyNextjsPages(fileList)).toEqual(expect.arrayContaining(expected));
    // Ensure no extra pages were identified
    expect(identifyNextjsPages(fileList).length).toBe(expected.length);
  });
});