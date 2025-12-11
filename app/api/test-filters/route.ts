import { NextRequest, NextResponse } from 'next/server';
import { getCategories, getTags, getBlogPosts } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('q') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const tagSlugs = searchParams.get('tags')?.split(',').filter(Boolean) || undefined;

    console.log('Test filters:', { searchQuery, categorySlug, tagSlugs });

    // Test getting categories and tags
    const [categories, tags, blogPosts] = await Promise.all([
      getCategories(),
      getTags(),
      getBlogPosts(1, 10, searchQuery, categorySlug, tagSlugs)
    ]);

    return NextResponse.json({
      filters: {
        searchQuery,
        categorySlug,
        tagSlugs
      },
      results: {
        categoriesCount: categories.length,
        tagsCount: tags.length,
        postsCount: blogPosts.posts.length,
        totalPosts: blogPosts.total
      },
      sampleData: {
        categories: categories.slice(0, 3),
        tags: tags.slice(0, 5),
        posts: blogPosts.posts.slice(0, 2).map(p => ({
          id: p.id,
          title: p.title,
          categories: p.categories?.map(c => c.name),
          tags: p.tags?.map(t => t.name)
        }))
      }
    });
  } catch (error) {
    console.error('Test filters error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test filters',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 