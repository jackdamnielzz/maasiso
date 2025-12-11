import { NextResponse } from 'next/server';

interface CountResult {
  categories: Record<string, number>;
  tags: Record<string, number>;
}

export async function GET() {
  try {
    console.log('[blog-counts-v2] Starting...');
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Fetch categories with their blog posts count
    const categoriesResponse = await fetch(
      `${baseUrl}/api/proxy/categories?populate[blog_posts][count]=true`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        next: { revalidate: 300 }
      }
    );
    
    // Fetch tags with their blog posts count
    const tagsResponse = await fetch(
      `${baseUrl}/api/proxy/tags?populate[blog_posts][count]=true`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        next: { revalidate: 300 }
      }
    );
    
    const counts: CountResult = {
      categories: {},
      tags: {}
    };
    
    // Process categories
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('[blog-counts-v2] Categories response:', {
        hasData: !!categoriesData.data,
        dataLength: categoriesData.data?.length,
        firstCategory: categoriesData.data?.[0]
      });
      
      if (categoriesData.data && Array.isArray(categoriesData.data)) {
        categoriesData.data.forEach((category: any) => {
          const slug = category.slug || category.attributes?.slug;
          const blogPostsCount = category.blog_posts?.count || 
                                category.attributes?.blog_posts?.count || 
                                category.blog_posts?.data?.length ||
                                category.attributes?.blog_posts?.data?.length ||
                                0;
          
          if (slug) {
            counts.categories[slug] = blogPostsCount;
          }
        });
      }
    } else {
      console.error('[blog-counts-v2] Failed to fetch categories:', categoriesResponse.status);
    }
    
    // Process tags
    if (tagsResponse.ok) {
      const tagsData = await tagsResponse.json();
      console.log('[blog-counts-v2] Tags response:', {
        hasData: !!tagsData.data,
        dataLength: tagsData.data?.length,
        firstTag: tagsData.data?.[0]
      });
      
      if (tagsData.data && Array.isArray(tagsData.data)) {
        tagsData.data.forEach((tag: any) => {
          const name = tag.name || tag.attributes?.name;
          const blogPostsCount = tag.blog_posts?.count || 
                                tag.attributes?.blog_posts?.count || 
                                tag.blog_posts?.data?.length ||
                                tag.attributes?.blog_posts?.data?.length ||
                                0;
          
          if (name) {
            counts.tags[name] = blogPostsCount;
          }
        });
      }
    } else {
      console.error('[blog-counts-v2] Failed to fetch tags:', tagsResponse.status);
    }
    
    console.log('[blog-counts-v2] Final counts:', {
      categoriesCount: Object.keys(counts.categories).length,
      tagsCount: Object.keys(counts.tags).length,
      categories: counts.categories,
      tags: counts.tags
    });
    
    return NextResponse.json(counts);
  } catch (error) {
    console.error('[blog-counts-v2] Error:', error);
    return NextResponse.json({ categories: {}, tags: {} });
  }
} 