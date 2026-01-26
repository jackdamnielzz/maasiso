'use client';

import { useEffect, useState } from 'react';
import { BlogPost } from '../../lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../lib/utils';

interface RelatedPostsProps {
  currentSlug?: string;
  categoryIds?: string[];
  posts?: BlogPost[];
}

export default function RelatedPosts({ currentSlug, categoryIds, posts }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>(posts || []);
  const [loading, setLoading] = useState(!posts);

  useEffect(() => {
    // If posts are provided directly, use them
    if (posts && posts.length > 0) {
      setRelatedPosts(posts);
      setLoading(false);
      return;
    }

    // If no currentSlug, skip fetching
    if (!currentSlug) {
      setLoading(false);
      return;
    }

    async function fetchRelatedPosts() {
      try {
        // Use the proxy API endpoint instead of directly accessing Strapi
        let url = `/api/proxy/blog-posts?filters[slug][$ne]=${currentSlug}&populate=*&pagination[limit]=3`;
        
        // Add category filter if categoryIds are provided
        if (categoryIds && categoryIds.length > 0) {
          const categoryFilter = categoryIds.map(id => `filters[categories][id][$in]=${id}`).join('&');
          url += `&${categoryFilter}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch related posts');
        }

        const data = await response.json();
        // Check if data exists and has the expected structure
        if (!data?.data || !Array.isArray(data.data)) {
          console.warn('Unexpected API response format:', data);
          setRelatedPosts([]);
          return;
        }

        const fetchedPosts = data.data
          .filter((post: any) => post && post.attributes && post.attributes.title)
          .map((post: any) => ({
            id: post.id,
            title: post.attributes.title,
            slug: post.attributes.slug,
            publishedAt: post.attributes.publishedAt,
            createdAt: post.attributes.createdAt,
            updatedAt: post.attributes.updatedAt,
            featuredImage: post.attributes.featuredImage?.data?.attributes ? {
              id: post.attributes.featuredImage.data.id,
              url: post.attributes.featuredImage.data.attributes.url,
              alternativeText: post.attributes.featuredImage.data.attributes.alternativeText
            } : undefined
          }));

        setRelatedPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedPosts();
  }, [currentSlug, posts]);

  if (loading) {
    return <div>Loading related posts...</div>;
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link 
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group block"
          >
            <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 group-hover:transform group-hover:scale-105">
              {post.featuredImage && (
                <div className="relative w-full h-48">
                  <Image
                    src={
                      post.featuredImage.url.startsWith('http')
                        ? post.featuredImage.url
                        : `/api/proxy/assets/uploads/${post.featuredImage.url.split('/uploads/').pop()}`
                    }
                    alt={post.featuredImage.alternativeText || post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                  {post.title}
                </h3>
                {post.publishedAt && (
                  <time className="text-gray-600 text-sm" dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
