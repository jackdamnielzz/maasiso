'use client';

import { useState, useEffect } from 'react';

interface BlogPost {
  documentId: string;
  title: string;
  slug: string;
}

interface StrapiPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  relatedPosts?: { documentId: string; title: string; slug: string }[];
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://peaceful-insight-production.up.railway.app';

export default function RelatedPostsViewer() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<string>('');
  const [currentRelated, setCurrentRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch related posts when a post is selected
  useEffect(() => {
    if (selectedPost) {
      fetchRelatedPosts(selectedPost);
    } else {
      setCurrentRelated([]);
    }
  }, [selectedPost]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${STRAPI_URL}/api/blog-posts?pagination[limit]=100&fields[0]=title&fields[1]=slug&filters[publishedAt][$notNull]=true&sort=title:asc`);
      const data = await response.json();
      
      if (data.data) {
        const blogPosts: BlogPost[] = data.data.map((post: StrapiPost) => ({
          documentId: post.documentId,
          title: post.title,
          slug: post.slug
        }));
        setPosts(blogPosts);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Kon blog posts niet laden');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (documentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${STRAPI_URL}/api/blog-posts/${documentId}?populate[relatedPosts][fields][0]=title&populate[relatedPosts][fields][1]=slug`);
      const data = await response.json();
      
      if (data.data?.relatedPosts) {
        const related: BlogPost[] = data.data.relatedPosts.map((post: StrapiPost) => ({
          documentId: post.documentId,
          title: post.title,
          slug: post.slug
        }));
        setCurrentRelated(related);
      } else {
        setCurrentRelated([]);
      }
    } catch (err) {
      console.error('Error fetching related posts:', err);
      setError('Kon gerelateerde posts niet laden');
    } finally {
      setLoading(false);
    }
  };

  const selectedPostData = posts.find(p => p.documentId === selectedPost);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerelateerde Posts Viewer
        </h1>
        
        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-amber-800 flex items-center gap-2">
            <span>⚠️</span> Strapi v5 Bug
          </h2>
          <p className="text-amber-700 text-sm mt-1">
            De Strapi v5 Admin UI heeft een bug met self-referential relaties. 
            Je kunt hier de huidige relaties bekijken, maar om ze te wijzigen moet je het script gebruiken.
          </p>
          <div className="mt-3 p-3 bg-gray-800 rounded text-sm font-mono text-green-400">
            <p className="text-gray-400"># Open een terminal in de project folder en run:</p>
            <p>node scripts/link-gerelateerde-posts.js</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Post Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecteer een blog post om de relaties te bekijken:
          </label>
          <select
            value={selectedPost}
            onChange={(e) => setSelectedPost(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">-- Kies een post --</option>
            {posts.map((post) => (
              <option key={post.documentId} value={post.documentId}>
                {post.title}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Post Info */}
        {selectedPostData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900">Geselecteerd:</h2>
            <p className="text-blue-800">{selectedPostData.title}</p>
            <p className="text-sm text-blue-600">/{selectedPostData.slug}</p>
            <p className="text-xs text-blue-500 mt-1">Document ID: {selectedPostData.documentId}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
            <p className="text-gray-500">Laden...</p>
          </div>
        )}

        {/* Current Related Posts */}
        {selectedPost && !loading && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Huidige gerelateerde posts ({currentRelated.length}):
            </h2>
            
            {currentRelated.length > 0 ? (
              <ul className="space-y-3">
                {currentRelated.map((post) => (
                  <li key={post.documentId} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <div>
                      <p className="font-medium text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-500">/{post.slug}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">📭</p>
                <p>Geen gerelateerde posts gevonden.</p>
                <p className="text-sm mt-2">Gebruik het script om relaties toe te voegen.</p>
              </div>
            )}
          </div>
        )}

        {/* Script Instructions */}
        {selectedPost && (
          <div className="mt-6 bg-gray-100 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Relaties wijzigen via script:
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">1. Open een terminal in de project folder</p>
              <p className="text-gray-600">2. Run het interactieve script:</p>
              <div className="p-3 bg-gray-800 rounded font-mono text-green-400">
                node scripts/link-gerelateerde-posts.js
              </div>
              <p className="text-gray-600 mt-3">Of gebruik het directe commando:</p>
              <div className="p-3 bg-gray-800 rounded font-mono text-green-400 text-xs overflow-x-auto">
                node scripts/direct-link-related-posts.js {selectedPostData?.slug || '<slug>'} &lt;target-slug-1&gt; &lt;target-slug-2&gt;
              </div>
            </div>
          </div>
        )}

        {/* All Posts Overview */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alle blog posts ({posts.length}):
          </h2>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-2 font-medium text-gray-700">Titel</th>
                  <th className="text-left p-2 font-medium text-gray-700">Slug</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr 
                    key={post.documentId} 
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedPost(post.documentId)}
                  >
                    <td className="p-2">{post.title}</td>
                    <td className="p-2 text-gray-500">{post.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
