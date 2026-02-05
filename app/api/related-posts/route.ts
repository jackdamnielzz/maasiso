import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireAdminAuth } from '@/lib/admin/apiAuth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://peaceful-insight-production.up.railway.app';
const DATABASE_URL = process.env.DATABASE_URL;

// Direct database access to bypass Strapi v5 bug with self-referential relations

interface BlogPostRow {
  id: number;
  document_id: string;
  title: string;
  slug: string;
  published_at: string | null;
}

interface RelationRow {
  inv_blog_post_id: number;
}

const JOIN_TABLE = 'blog_posts_related_posts_lnk';

// Create pool lazily
let pool: Pool | null = null;

function getPool(): Pool | null {
  if (!DATABASE_URL) return null;
  
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

// GET: Fetch all posts or related posts for a specific post
export async function GET(request: NextRequest) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');
  const action = searchParams.get('action');

  // If no DATABASE_URL, fall back to Strapi API (read-only)
  const dbPool = getPool();
  if (!dbPool) {
    return handleStrapiGet(action, documentId);
  }

  try {
    if (action === 'list') {
      // List all published blog posts
      const result = await dbPool.query<BlogPostRow>(`
        SELECT DISTINCT ON (document_id) 
          id, document_id, title, slug, published_at
        FROM blog_posts 
        WHERE published_at IS NOT NULL
        ORDER BY document_id, published_at DESC
      `);
      
      return NextResponse.json({
        success: true,
        source: 'database',
        posts: result.rows.map((row: BlogPostRow) => ({
          id: row.id,
          documentId: row.document_id,
          title: row.title,
          slug: row.slug
        }))
      });
    }

    if (documentId) {
      // Get related posts for a specific document
      const sourceResult = await dbPool.query<BlogPostRow>(
        'SELECT id FROM blog_posts WHERE document_id = $1 LIMIT 1',
        [documentId]
      );

      if (sourceResult.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
      }

      const sourceId = sourceResult.rows[0].id;

      // Get related post IDs
      const relationsResult = await dbPool.query<RelationRow>(
        `SELECT inv_blog_post_id FROM ${JOIN_TABLE} WHERE blog_post_id = $1`,
        [sourceId]
      );

      const relatedIds = relationsResult.rows.map((r: RelationRow) => r.inv_blog_post_id);

      if (relatedIds.length === 0) {
        return NextResponse.json({ success: true, source: 'database', relatedPosts: [] });
      }

      // Get details of related posts
      const relatedResult = await dbPool.query<BlogPostRow>(
        `SELECT DISTINCT ON (document_id) id, document_id, title, slug 
         FROM blog_posts 
         WHERE id = ANY($1)
         ORDER BY document_id`,
        [relatedIds]
      );

      return NextResponse.json({
        success: true,
        source: 'database',
        relatedPosts: relatedResult.rows.map((row: BlogPostRow) => ({
          id: row.id,
          documentId: row.document_id,
          title: row.title,
          slug: row.slug
        }))
      });
    }

    return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Database error:', error);
    // Fall back to Strapi API on database error
    return handleStrapiGet(action, documentId);
  }
}

// Fallback to Strapi API for read operations
async function handleStrapiGet(action: string | null, documentId: string | null) {
  try {
    if (action === 'list') {
      const response = await fetch(
        `${STRAPI_URL}/api/blog-posts?pagination[limit]=100&fields[0]=title&fields[1]=slug&filters[publishedAt][$notNull]=true&sort=title:asc`
      );
      const data = await response.json();
      
      if (data.data) {
        return NextResponse.json({
          success: true,
          source: 'strapi',
          posts: data.data.map((post: { documentId: string; title: string; slug: string }) => ({
            documentId: post.documentId,
            title: post.title,
            slug: post.slug
          }))
        });
      }
    }

    if (documentId) {
      const response = await fetch(
        `${STRAPI_URL}/api/blog-posts/${documentId}?populate[relatedPosts][fields][0]=title&populate[relatedPosts][fields][1]=slug`
      );
      const data = await response.json();
      
      if (data.data?.relatedPosts) {
        return NextResponse.json({
          success: true,
          source: 'strapi',
          relatedPosts: data.data.relatedPosts.map((post: { documentId: string; title: string; slug: string }) => ({
            documentId: post.documentId,
            title: post.title,
            slug: post.slug
          }))
        });
      }
      return NextResponse.json({ success: true, source: 'strapi', relatedPosts: [] });
    }

    return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Strapi API error:', error);
    return NextResponse.json({ success: false, error: 'API error' }, { status: 500 });
  }
}

// POST: Update related posts for a document
export async function POST(request: NextRequest) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  const dbPool = getPool();
  
  if (!dbPool) {
    return NextResponse.json({ 
      success: false, 
      error: 'DATABASE_URL not configured. Cannot save relations without direct database access.',
      hint: 'Add DATABASE_URL to your .env.local file with your PostgreSQL connection string.'
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { documentId, relatedDocumentIds } = body;

    if (!documentId) {
      return NextResponse.json({ success: false, error: 'documentId is required' }, { status: 400 });
    }

    if (!Array.isArray(relatedDocumentIds)) {
      return NextResponse.json({ success: false, error: 'relatedDocumentIds must be an array' }, { status: 400 });
    }

    // Get all version IDs for the source document
    const sourceResult = await dbPool.query<BlogPostRow>(
      'SELECT id FROM blog_posts WHERE document_id = $1',
      [documentId]
    );

    if (sourceResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Source post not found' }, { status: 404 });
    }

    const sourceVersionIds = sourceResult.rows.map((r: BlogPostRow) => r.id);

    // Get target IDs (prefer published versions)
    const targetIds: number[] = [];
    for (const targetDocId of relatedDocumentIds) {
      const targetResult = await dbPool.query<BlogPostRow>(
        `SELECT id, published_at FROM blog_posts 
         WHERE document_id = $1 
         ORDER BY published_at DESC NULLS LAST 
         LIMIT 1`,
        [targetDocId]
      );
      if (targetResult.rows.length > 0) {
        targetIds.push(targetResult.rows[0].id);
      }
    }

    // Update relations for all versions of the source document
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      for (const sourceId of sourceVersionIds) {
        // Delete existing relations
        await client.query(
          `DELETE FROM ${JOIN_TABLE} WHERE blog_post_id = $1`,
          [sourceId]
        );

        // Insert new relations
        if (targetIds.length > 0) {
          const values = targetIds.map((_, i) => `($1, $${i + 2})`).join(', ');
          const params = [sourceId, ...targetIds];
          await client.query(
            `INSERT INTO ${JOIN_TABLE} (blog_post_id, inv_blog_post_id) VALUES ${values}`,
            params
          );
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({
      success: true,
      message: `Successfully linked ${targetIds.length} related posts to ${sourceVersionIds.length} version(s)`,
      relatedPostsCount: targetIds.length,
      versionsUpdated: sourceVersionIds.length
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
