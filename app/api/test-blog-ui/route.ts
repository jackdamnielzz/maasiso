import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Blog Counts Test</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .category { margin: 10px 0; padding: 10px; background: #f0f0f0; }
        .loading { color: #666; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <h1>Blog Counts Test</h1>
      <div id="status" class="loading">Loading counts...</div>
      <div id="categories"></div>
      <div id="tags"></div>
      
      <script>
        async function loadCounts() {
          const statusEl = document.getElementById('status');
          const categoriesEl = document.getElementById('categories');
          const tagsEl = document.getElementById('tags');
          
          try {
            // Try v2 first
            let response = await fetch('/api/blog-counts-v2');
            console.log('V2 response:', response.status);
            
            // If v2 fails, try v1
            if (!response.ok) {
              console.log('V2 failed, trying V1...');
              response = await fetch('/api/blog-counts');
              console.log('V1 response:', response.status);
            }
            
            if (!response.ok) {
              throw new Error('Failed to fetch counts');
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            
            statusEl.textContent = 'Counts loaded successfully!';
            statusEl.className = '';
            
            // Display categories
            categoriesEl.innerHTML = '<h2>Categories</h2>';
            for (const [slug, count] of Object.entries(data.categories)) {
              if (count > 0) {
                categoriesEl.innerHTML += \`<div class="category">\${slug}: \${count} posts</div>\`;
              }
            }
            
            // Display tags
            tagsEl.innerHTML = '<h2>Tags</h2>';
            for (const [name, count] of Object.entries(data.tags)) {
              if (count > 0) {
                tagsEl.innerHTML += \`<div class="category">\${name}: \${count} posts</div>\`;
              }
            }
          } catch (error) {
            console.error('Error:', error);
            statusEl.textContent = 'Error loading counts: ' + error.message;
            statusEl.className = 'error';
          }
        }
        
        // Load counts on page load
        loadCounts();
      </script>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 