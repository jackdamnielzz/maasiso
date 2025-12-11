import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('🧪 Testing Tags and Categories Fix...');
    
    // Test through our proxy route to see if normalization works
    const baseUrl = 'https://maasiso.nl/api/proxy';
    
    const blogPostsResponse = await fetch(`${baseUrl}/blog-posts?pagination[limit]=2&populate=*`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!blogPostsResponse.ok) {
      throw new Error(`Blog posts request failed: ${blogPostsResponse.status}`);
    }

    const blogPostsData = await blogPostsResponse.json();
    
    console.log('📝 Blog Posts Response Structure:', {
      status: blogPostsResponse.status,
      dataExists: !!blogPostsData.data,
      itemCount: blogPostsData.data?.length || 0,
    });

    // Check first post structure
    const firstPost = blogPostsData.data?.[0];
    if (firstPost) {
      console.log('🔍 First Post Analysis:', {
        id: firstPost.id,
        title: firstPost.title,
        hasTags: Array.isArray(firstPost.tags),
        tagCount: Array.isArray(firstPost.tags) ? firstPost.tags.length : 0,
        hasCategories: Array.isArray(firstPost.categories),
        categoryCount: Array.isArray(firstPost.categories) ? firstPost.categories.length : 0,
        tagsStructure: firstPost.tags ? (Array.isArray(firstPost.tags) ? 'Array' : typeof firstPost.tags) : 'Not present',
        categoriesStructure: firstPost.categories ? (Array.isArray(firstPost.categories) ? 'Array' : typeof firstPost.categories) : 'Not present',
        sampleTag: Array.isArray(firstPost.tags) && firstPost.tags.length > 0 ? firstPost.tags[0] : null,
        sampleCategory: Array.isArray(firstPost.categories) && firstPost.categories.length > 0 ? firstPost.categories[0] : null
      });
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      test: 'Tags and Categories Fix',
      results: {
        blogPosts: {
          count: blogPostsData.data?.length || 0,
          firstPost: firstPost ? {
            id: firstPost.id,
            title: firstPost.title,
            tags: {
              isArray: Array.isArray(firstPost.tags),
              count: Array.isArray(firstPost.tags) ? firstPost.tags.length : 0,
              sample: Array.isArray(firstPost.tags) && firstPost.tags.length > 0 ? firstPost.tags[0] : null
            },
            categories: {
              isArray: Array.isArray(firstPost.categories),
              count: Array.isArray(firstPost.categories) ? firstPost.categories.length : 0,
              sample: Array.isArray(firstPost.categories) && firstPost.categories.length > 0 ? firstPost.categories[0] : null
            }
          } : null
        }
      }
    });
  } catch (error) {
    console.error('❌ Tags Fix Test Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 