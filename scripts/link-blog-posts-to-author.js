const API_URL = 'http://localhost:1337';
const API_TOKEN = '9ff727d730447da883cad384524bc2e9891de14e526d0273c0785710762dc0ef2aa6900a855948e3fa6ed72a1927178b6c725fa34605959aac8cb69794463c1484cd0325548fc3a5c88898cb9099ac114e40c19bb6755c8d2f7d9110330be97031587152e34f6e37992eb31faef66c92f60df20b32b80b95029744047504f9f9';
const AUTHOR_DOCUMENT_ID = 'k8ihukio0ad1rrc4smuve3tv';

// Helper to truncate string
function truncate(str, maxLen) {
  if (!str) return str;
  return str.length > maxLen ? str.substring(0, maxLen) : str;
}

async function linkBlogPostsToAuthor() {
  const headers = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  };

  // 1. Fetch all blog posts with all fields
  console.log('Fetching all blog posts...');
  const response = await fetch(`${API_URL}/api/blog-posts?pagination[pageSize]=100&populate=*`, { headers });
  const data = await response.json();
  
  if (!data.data) {
    console.error('Failed to fetch blog posts:', data);
    return;
  }

  console.log(`Found ${data.data.length} blog posts`);

  // 2. Update each blog post with the author relation
  let successCount = 0;
  let errorCount = 0;

  for (const post of data.data) {
    try {
      // Build update data with all required fields, fixing validation issues
      const updateData = {
        title: truncate(post.title, 100), // Max 100 chars
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || `Lees meer over ${post.title}`, // Default if null
        publishedAt: post.publishedAt,
        // Fix SEO fields
        seoTitle: truncate(post.seoTitle, 60),
        seoDescription: truncate(post.seoDescription, 160),
        featuredImageAltText: post.featuredImageAltText || post.title, // Default if null
        schemaType: post.schemaType || 'Article', // Default if null
        // Add author relation
        author: { connect: [{ documentId: AUTHOR_DOCUMENT_ID }] }
      };

      // Handle tldr - needs at least 3 items (component uses 'point' field)
      // Strip out 'id' fields that may be present from populate
      if (post.tldr && Array.isArray(post.tldr) && post.tldr.length >= 3) {
        updateData.tldr = post.tldr.map(item => ({ point: item.point }));
      } else {
        // Create default tldr items from the title
        updateData.tldr = [
          { point: `Leer over ${post.title.substring(0, 50)}` },
          { point: 'Praktische tips en best practices' },
          { point: 'Implementatie stappen voor uw organisatie' }
        ];
      }

      // Add optional fields if they exist and are valid
      if (post.readTime) updateData.readTime = post.readTime;
      if (post.metaTitle) updateData.metaTitle = post.metaTitle;
      if (post.metaDescription) updateData.metaDescription = post.metaDescription;
      if (post.keywords) updateData.keywords = post.keywords;
      if (post.canonicalUrl) updateData.canonicalUrl = post.canonicalUrl;
      if (post.category) updateData.category = post.category;
      if (post.publishDate) updateData.publishDate = post.publishDate;

      const updateResponse = await fetch(
        `${API_URL}/api/blog-posts/${post.documentId}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ data: updateData })
        }
      );

      if (updateResponse.ok) {
        successCount++;
        console.log(`✅ Updated: ${post.title || post.documentId}`);
      } else {
        const error = await updateResponse.json();
        errorCount++;
        console.error(`❌ Failed to update ${post.documentId}:`, JSON.stringify(error, null, 2));
      }
    } catch (err) {
      errorCount++;
      console.error(`❌ Error updating ${post.documentId}:`, err.message);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total posts: ${data.data.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

linkBlogPostsToAuthor().catch(console.error);
