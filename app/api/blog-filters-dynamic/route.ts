import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('[blog-filters-dynamic] Starting simple filter data fetch');
    
    // Fetch all blog posts with their relationships using the working API
    const { getBlogPosts } = await import('@/lib/api');
    const { posts } = await getBlogPosts(1, 100); // Get first 100 posts
    
    console.log('[blog-filters-dynamic] Fetched posts:', posts.length);
    
    // Count categories and tags that are actually used
    const categoryCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    posts.forEach((post: any) => {
      // Count categories
      if (post.categories && Array.isArray(post.categories)) {
        post.categories.forEach((category: any) => {
          if (category && category.id) {
            const key = category.id.toString();
            categoryCounts[key] = (categoryCounts[key] || 0) + 1;
          }
        });
      }

      // Count tags  
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: any) => {
          if (tag && tag.id) {
            const key = tag.id.toString();
            tagCounts[key] = (tagCounts[key] || 0) + 1;
          }
        });
      }
    });

    console.log('[blog-filters-dynamic] Final counts:', {
      categories: Object.keys(categoryCounts).length,
      tags: Object.keys(tagCounts).length,
      categoryCounts,
      tagCounts
    });

    return NextResponse.json({
      categories: categoryCounts,
      tags: tagCounts
    });

  } catch (error) {
    console.error('[blog-filters-dynamic] Error:', error);
    return NextResponse.json({ 
      categories: {}, 
      tags: {},
      error: 'Internal server error'
    });
  }
} 