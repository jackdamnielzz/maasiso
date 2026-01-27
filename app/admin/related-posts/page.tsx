'use client';

import { useState, useEffect } from 'react';

interface BlogPost {
  documentId: string;
  title: string;
  slug: string;
}

interface RelatedPostsResponse {
  documentId: string;
  relatedPosts: BlogPost[];
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://peaceful-insight-production.up.railway.app';

export default function RelatedPostsManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<string>('');
  const [currentRelated, setCurrentRelated] = useState<BlogPost[]>([]);
  const [selectedRelated, setSelectedRelated] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      setSelectedRelated([]);
    }
  }, [selectedPost]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/blog-posts/list-for-relations`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMessage({ type: 'error', text: 'Kon blog posts niet laden' });
    }
  };

  const fetchRelatedPosts = async (documentId: string) => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/blog-posts/${documentId}/related-posts`);
      const data: RelatedPostsResponse = await response.json();
      setCurrentRelated(data.relatedPosts || []);
      setSelectedRelated(data.relatedPosts?.map(p => p.documentId) || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      setMessage({ type: 'error', text: 'Kon gerelateerde posts niet laden' });
    }
  };

  const handleToggleRelated = (documentId: string) => {
    setSelectedRelated(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedPost) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${STRAPI_URL}/api/blog-posts/${selectedPost}/related-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ relatedPosts: selectedRelated }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `✓ ${data.relatedPostsCount} gerelateerde posts opgeslagen!` });
        // Refresh the current related posts
        await fetchRelatedPosts(selectedPost);
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Opslaan mislukt' });
      }
    } catch (error) {
      console.error('Error saving related posts:', error);
      setMessage({ type: 'error', text: 'Opslaan mislukt - controleer de console' });
    } finally {
      setLoading(false);
    }
  };

  const selectedPostData = posts.find(p => p.documentId === selectedPost);
  const availablePosts = posts.filter(p => p.documentId !== selectedPost);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerelateerde Posts Beheren
        </h1>
        <p className="text-gray-600 mb-8">
          Selecteer een blog post en kies welke andere posts gerelateerd moeten zijn.
          <br />
          <span className="text-sm text-amber-600">
            ⚠️ Dit is een workaround voor de Strapi v5 Admin UI bug met self-referential relaties.
          </span>
        </p>

        {/* Post Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecteer een blog post:
          </label>
          <select
            value={selectedPost}
            onChange={(e) => setSelectedPost(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          </div>
        )}

        {/* Related Posts Selection */}
        {selectedPost && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Selecteer gerelateerde posts ({selectedRelated.length} geselecteerd):
            </h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availablePosts.map((post) => {
                const isSelected = selectedRelated.includes(post.documentId);
                return (
                  <label
                    key={post.documentId}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleRelated(post.documentId)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-500">/{post.slug}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Button */}
        {selectedPost && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Opslaan...' : 'Opslaan'}
            </button>

            {message && (
              <p
                className={`text-sm font-medium ${
                  message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        )}

        {/* Current Related Posts */}
        {selectedPost && currentRelated.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Huidige gerelateerde posts:
            </h2>
            <ul className="space-y-2">
              {currentRelated.map((post) => (
                <li key={post.documentId} className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  {post.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
