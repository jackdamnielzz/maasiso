import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Try different populate syntaxes for SINGULAR relations
    const queries = [
      'populate=*',
      'populate[0]=Category&populate[1]=Tag',
      'populate=Category,Tag',
      'populate[Category]=*&populate[Tag]=*',
      'populate[Category][fields][0]=name&populate[Category][fields][1]=slug&populate[Tag][fields][0]=name',
      'populate=Category.name,Category.slug,Tag.name',
      // Also try lowercase
      'populate[0]=category&populate[1]=tag',
      'populate=category,tag',
      'populate[category]=*&populate[tag]=*'
    ];
    
    const results: any[] = [];
    
    for (const query of queries) {
      try {
        const response = await fetch(
          `${baseUrl}/api/proxy/blog-posts?pagination[limit]=1&${query}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const post = data.data?.[0];
          
          results.push({
            query,
            success: true,
            hasCategory: !!(post?.Category || post?.category || post?.attributes?.Category || post?.attributes?.category),
            hasTag: !!(post?.Tag || post?.tag || post?.attributes?.Tag || post?.attributes?.tag),
            structure: post ? {
              topLevel: Object.keys(post),
              Category: post.Category || 'not found',
              category: post.category || 'not found',
              Tag: post.Tag || 'not found',
              tag: post.tag || 'not found',
              inAttributes: post.attributes ? {
                Category: post.attributes.Category || 'not found',
                category: post.attributes.category || 'not found',
                Tag: post.attributes.Tag || 'not found',
                tag: post.attributes.tag || 'not found'
              } : 'no attributes'
            } : null
          });
        } else {
          results.push({
            query,
            success: false,
            status: response.status
          });
        }
      } catch (error) {
        results.push({
          query,
          success: false,
          error: String(error)
        });
      }
    }
    
    return NextResponse.json({
      testedQueries: results.length,
      results
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 