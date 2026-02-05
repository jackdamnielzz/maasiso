/**
 * Setup Production Author Script
 * 
 * This script:
 * 1. Creates the author "Niels Maas" in production Strapi
 * 2. Links all blog posts to this author
 * 
 * Run: node scripts/setup-production-author.js
 */

const PRODUCTION_URL = 'https://peaceful-insight-production.up.railway.app';
const API_TOKEN = '[REDACTED_STRAPI_TOKEN]';

const authorData = {
  data: {
    name: "Niels Maas",
    slug: "niels-maas",
    bio: "Oprichter en lead consultant bij MaasISO. Met ongeveer 10 jaar ervaring in kwaliteitsmanagement, informatiebeveiliging en ISO-certificering helpt Niels organisaties bij het implementeren van effectieve managementsystemen. Specialist op het gebied van informatiebeveiliging, Baseline Informatiebeveiliging Overheid (BIO) en Artificial Intelligence governance.",
    credentials: "Lead Auditor ISO 9001, ISO 14001, ISO 27001, ISO 45001, ISO 50001, ISO 16175, VCA",
    expertise: ["ISO 9001", "ISO 14001", "ISO 27001", "ISO 45001", "ISO 50001", "ISO 16175", "VCA", "Kwaliteitsmanagement", "Informatiebeveiliging", "BIO", "Artificial Intelligence", "Risicomanagement"]
  }
};

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${PRODUCTION_URL}/api${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`Error ${response.status} for ${method} ${endpoint}:`, JSON.stringify(data, null, 2));
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
  }
  
  return data;
}

async function checkExistingAuthor() {
  console.log('\n📋 Checking for existing authors...');
  try {
    const result = await makeRequest('/authors');
    const authors = result.data || [];
    console.log(`   Found ${authors.length} existing author(s)`);
    
    // Check if Niels Maas already exists
    const nielsAuthor = authors.find(a => a.name === 'Niels Maas');
    if (nielsAuthor) {
      console.log(`   ✓ Author "Niels Maas" already exists with ID: ${nielsAuthor.id}`);
      return nielsAuthor.id;
    }
    
    return null;
  } catch (error) {
    console.log('   No existing authors found or endpoint not ready');
    return null;
  }
}

async function createAuthor() {
  console.log('\n👤 Creating author "Niels Maas"...');
  
  try {
    const result = await makeRequest('/authors', 'POST', authorData);
    const authorId = result.data.id;
    console.log(`   ✓ Author created successfully with ID: ${authorId}`);
    console.log(`   Name: ${result.data.name}`);
    return authorId;
  } catch (error) {
    console.error('   ✗ Failed to create author:', error.message);
    throw error;
  }
}

async function getBlogPosts() {
  console.log('\n📰 Fetching all blog posts...');
  
  try {
    // Get all blog posts with pagination
    let allPosts = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const result = await makeRequest(`/blog-posts?pagination[page]=${page}&pagination[pageSize]=100&populate=author`);
      const posts = result.data || [];
      allPosts = allPosts.concat(posts);
      
      const pagination = result.meta?.pagination;
      if (pagination && page < pagination.pageCount) {
        page++;
      } else {
        hasMore = false;
      }
    }
    
    console.log(`   Found ${allPosts.length} blog post(s)`);
    
    // Debug: show first post structure
    if (allPosts.length > 0) {
      console.log(`   First post structure: id=${allPosts[0].id}, documentId=${allPosts[0].documentId}`);
    }
    
    return allPosts;
  } catch (error) {
    console.error('   ✗ Failed to fetch blog posts:', error.message);
    return [];
  }
}

async function linkPostToAuthor(documentId, post, authorId) {
  try {
    // Generate excerpt from content if not available
    const excerpt = post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : 'Lees meer over dit onderwerp.');
    
    // Generate tldr from content if not available (minimum 3 items required)
    // Component uses 'point' field, not 'text'
    let tldr = post.tldr;
    if (!tldr || tldr.length < 3) {
      tldr = [
        { point: 'Belangrijke inzichten over dit onderwerp' },
        { point: 'Praktische tips en adviezen' },
        { point: 'Relevante informatie voor uw organisatie' }
      ];
    }
    
    // Default schemaType - must be one of: "Article", "HowTo", "FAQPage"
    const schemaType = post.schemaType || 'Article';
    
    // Strapi v5 uses documentId for API operations
    await makeRequest(`/blog-posts/${documentId}`, 'PUT', {
      data: {
        author: authorId,
        excerpt: excerpt,
        tldr: tldr,
        schemaType: schemaType
      }
    });
    console.log(`   ✓ Linked: "${post.title}" (documentId: ${documentId})`);
    return true;
  } catch (error) {
    console.error(`   ✗ Failed to link post ${documentId}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Production Author Setup Script');
  console.log('='.repeat(60));
  console.log(`\nTarget: ${PRODUCTION_URL}`);
  
  try {
    // Step 1: Check for existing author
    let authorId = await checkExistingAuthor();
    
    // Step 2: Create author if doesn't exist
    if (!authorId) {
      authorId = await createAuthor();
    }
    
    // Step 3: Get all blog posts
    const posts = await getBlogPosts();
    
    if (posts.length === 0) {
      console.log('\n⚠️  No blog posts found to link');
      return;
    }
    
    // Step 4: Link posts to author
    console.log(`\n🔗 Linking ${posts.length} blog posts to author...`);
    let linked = 0;
    let alreadyLinked = 0;
    let failed = 0;
    
    for (const post of posts) {
      // Check if already linked to this author
      const currentAuthor = post.author?.documentId || post.author?.id || post.author;
      if (currentAuthor === authorId) {
        console.log(`   ⏭️  Already linked: "${post.title}" (documentId: ${post.documentId})`);
        alreadyLinked++;
        continue;
      }
      
      // Strapi v5 uses documentId for API operations
      const success = await linkPostToAuthor(post.documentId, post, authorId);
      if (success) {
        linked++;
      } else {
        failed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary');
    console.log('='.repeat(60));
    console.log(`Author ID: ${authorId}`);
    console.log(`Total blog posts: ${posts.length}`);
    console.log(`Newly linked: ${linked}`);
    console.log(`Already linked: ${alreadyLinked}`);
    console.log(`Failed: ${failed}`);
    console.log('\n✅ Production author setup complete!');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();
