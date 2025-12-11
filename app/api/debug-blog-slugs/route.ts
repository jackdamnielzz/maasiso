import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const response = await fetch(
      `${baseUrl}/api/proxy/blog-posts?pagination[limit]=100&fields[0]=slug&fields[1]=title`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
    
    const data = await response.json();
    
    const slugs = data.data?.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title
    })) || [];
    
    return NextResponse.json({
      totalPosts: slugs.length,
      slugs: slugs.sort((a: any, b: any) => a.slug.localeCompare(b.slug))
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 