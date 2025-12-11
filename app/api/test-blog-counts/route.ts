import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[test-blog-counts] Starting test...');
    
    // Fetch blog posts directly
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // First, let's see what fields are available without populate
    const simpleResponse = await fetch(
      `${baseUrl}/api/proxy/blog-posts?pagination[limit]=1`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    let simpleData = null;
    if (simpleResponse.ok) {
      simpleData = await simpleResponse.json();
    }
    
    // Now try with populate
    const postsResponse = await fetch(
      `${baseUrl}/api/proxy/blog-posts?pagination[limit]=10&populate=*`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!postsResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch posts',
        status: postsResponse.status,
        url: `${baseUrl}/api/proxy/blog-posts?pagination[limit]=10&populate=*`
      });
    }
    
    const postsData = await postsResponse.json();
    
    // Get detailed structure of first post
    const firstPost = postsData.data?.[0];
    const firstPostStructure = firstPost ? {
      topLevelKeys: Object.keys(firstPost),
      hasAttributes: !!firstPost.attributes,
      attributeKeys: firstPost.attributes ? Object.keys(firstPost.attributes) : [],
      fullStructure: firstPost
    } : null;
    
    // Count categories and tags
    const counts = {
      categories: {} as Record<string, number>,
      tags: {} as Record<string, number>
    };
    
    let postsWithCategories = 0;
    let postsWithTags = 0;
    
    const samplePosts: any[] = [];
    
    if (postsData.data && Array.isArray(postsData.data)) {
      postsData.data.forEach((post: any, index: number) => {
        // Save first 3 posts as samples with full structure
        if (index < 3) {
          samplePosts.push({
            id: post.id,
            topLevelKeys: Object.keys(post),
            attributes: post.attributes,
            // Try to find categories and tags in different locations
            categoriesInAttributes: post.attributes?.categories,
            tagsInAttributes: post.attributes?.tags,
            directCategories: post.categories,
            directTags: post.tags
          });
        }
        
        // Try different locations for categories
        const categories = post.attributes?.categories?.data || 
                          post.categories?.data || 
                          post.attributes?.categories || 
                          post.categories;
                          
        const tags = post.attributes?.tags?.data || 
                     post.tags?.data || 
                     post.attributes?.tags || 
                     post.tags;
        
        // Count categories
        if (categories && Array.isArray(categories)) {
          if (categories.length > 0) {
            postsWithCategories++;
          }
          categories.forEach((category: any) => {
            const slug = category.attributes?.slug || category.slug;
            const name = category.attributes?.name || category.name;
            if (slug) {
              counts.categories[slug] = (counts.categories[slug] || 0) + 1;
            } else if (name) {
              counts.categories[name.toLowerCase().replace(/\s+/g, '-')] = 
                (counts.categories[name.toLowerCase().replace(/\s+/g, '-')] || 0) + 1;
            }
          });
        }
        
        // Count tags
        if (tags && Array.isArray(tags)) {
          if (tags.length > 0) {
            postsWithTags++;
          }
          tags.forEach((tag: any) => {
            const name = tag.attributes?.name || tag.name;
            if (name) {
              counts.tags[name] = (counts.tags[name] || 0) + 1;
            }
          });
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      simplePost: simpleData?.data?.[0] || null,
      firstPostStructure,
      counts,
      stats: {
        totalPosts: postsData.data?.length || 0,
        postsWithCategories,
        postsWithTags,
        uniqueCategories: Object.keys(counts.categories).length,
        uniqueTags: Object.keys(counts.tags).length
      },
      topCategories: Object.entries(counts.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      topTags: Object.entries(counts.tags)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      samplePosts,
      debug: {
        baseUrl,
        postsUrl: `${baseUrl}/api/proxy/blog-posts?pagination[limit]=10&populate=*`
      }
    });
  } catch (error) {
    console.error('[test-blog-counts] Error:', error);
    return NextResponse.json({ 
      error: 'Error in test',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 