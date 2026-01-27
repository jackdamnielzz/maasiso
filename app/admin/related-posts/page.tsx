'use client';

import { useState, useEffect, useCallback } from 'react';

interface BlogPost {
  id?: number;
  documentId: string;
  title: string;
  slug: string;
}

interface ApiResponse {
  success: boolean;
  source?: string;
  posts?: BlogPost[];
  relatedPosts?: BlogPost[];
  error?: string;
  hint?: string;
  message?: string;
  relatedPostsCount?: number;
  versionsUpdated?: number;
}

export default function RelatedPostsManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<string>('');
  const [currentRelated, setCurrentRelated] = useState<BlogPost[]>([]);
  const [selectedRelated, setSelectedRelated] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      setSelectedRelated(new Set());
      setHasChanges(false);
    }
  }, [selectedPost]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/related-posts?action=list');
      const data: ApiResponse = await response.json();
      
      if (data.success && data.posts) {
        setPosts(data.posts);
        setDataSource(data.source || 'unknown');
      } else {
        setError(data.error || 'Kon blog posts niet laden');
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
    setError(null);
    try {
      const response = await fetch(`/api/related-posts?documentId=${documentId}`);
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        const related = data.relatedPosts || [];
        setCurrentRelated(related);
        setSelectedRelated(new Set(related.map(p => p.documentId)));
        setHasChanges(false);
      } else {
        setError(data.error || 'Kon gerelateerde posts niet laden');
      }
    } catch (err) {
      console.error('Error fetching related posts:', err);
      setError('Kon gerelateerde posts niet laden');
    } finally {
      setLoading(false);
    }
  };

  const toggleRelated = useCallback((documentId: string) => {
    setSelectedRelated(prev => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
      } else {
        newSet.add(documentId);
      }
      return newSet;
    });
    setHasChanges(true);
    setSuccess(null);
  }, []);

  const saveRelations = async () => {
    if (!selectedPost) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/related-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedPost,
          relatedDocumentIds: Array.from(selectedRelated)
        })
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setSuccess(data.message || 'Relaties succesvol opgeslagen!');
        setHasChanges(false);
        // Refresh to show current state
        await fetchRelatedPosts(selectedPost);
      } else {
        setError(data.error || 'Kon relaties niet opslaan');
        if (data.hint) {
          setError(prev => `${prev}\n\n💡 ${data.hint}`);
        }
      }
    } catch (err) {
      console.error('Error saving relations:', err);
      setError('Kon relaties niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setSelectedRelated(new Set(currentRelated.map(p => p.documentId)));
    setHasChanges(false);
    setSuccess(null);
  };

  const selectedPostData = posts.find(p => p.documentId === selectedPost);
  
  // Filter posts for the selection list (exclude currently selected post)
  const availablePosts = posts.filter(p => 
    p.documentId !== selectedPost &&
    (searchTerm === '' || 
     p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCount = selectedRelated.size;
  const originalCount = currentRelated.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🔗 Related Posts Manager
          </h1>
          <p className="text-slate-600">
            Beheer gerelateerde blog posts direct vanuit deze interface
          </p>
          {dataSource && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              dataSource === 'database' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {dataSource === 'database' ? '✓ Direct database access' : '⚠️ Read-only (Strapi API)'}
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700 whitespace-pre-line">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Post Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            1. Selecteer een blog post:
          </label>
          <select
            value={selectedPost}
            onChange={(e) => setSelectedPost(e.target.value)}
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-blue-900 text-lg">{selectedPostData.title}</h2>
                <p className="text-blue-700">/{selectedPostData.slug}</p>
                <p className="text-xs text-blue-500 mt-1 font-mono">ID: {selectedPostData.documentId}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{selectedCount}</div>
                <div className="text-sm text-blue-500">gerelateerd</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        {selectedPost && !loading && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Available Posts */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span>📝</span>
                2. Selecteer gerelateerde posts
              </h2>
              
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Zoek posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Posts List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availablePosts.map((post) => {
                  const isSelected = selectedRelated.has(post.documentId);
                  return (
                    <button
                      key={post.documentId}
                      onClick={() => toggleRelated(post.documentId)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50 hover:bg-green-100'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xl ${isSelected ? 'text-green-500' : 'text-slate-300'}`}>
                          {isSelected ? '✓' : '○'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isSelected ? 'text-green-900' : 'text-slate-700'}`}>
                            {post.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">/{post.slug}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {availablePosts.length === 0 && (
                  <p className="text-center text-slate-500 py-8">
                    {searchTerm ? 'Geen posts gevonden' : 'Geen andere posts beschikbaar'}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Selected Posts */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span>✓</span>
                Geselecteerde relaties ({selectedCount})
              </h2>

              {selectedCount > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Array.from(selectedRelated).map((docId) => {
                    const post = posts.find(p => p.documentId === docId);
                    if (!post) return null;
                    const isOriginal = currentRelated.some(p => p.documentId === docId);
                    return (
                      <div
                        key={docId}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isOriginal ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{post.title}</p>
                          <p className="text-xs text-slate-500">/{post.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isOriginal && (
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">nieuw</span>
                          )}
                          <button
                            onClick={() => toggleRelated(docId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded"
                            title="Verwijderen"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-4xl mb-3">📭</p>
                  <p>Geen relaties geselecteerd</p>
                  <p className="text-sm mt-1">Klik op posts links om ze toe te voegen</p>
                </div>
              )}

              {/* Changes indicator */}
              {hasChanges && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm font-medium">
                    ⚡ Je hebt onopgeslagen wijzigingen
                  </p>
                  <p className="text-amber-600 text-xs mt-1">
                    Origineel: {originalCount} → Nieuw: {selectedCount}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedPost && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="text-sm text-slate-600">
                {hasChanges ? (
                  <span className="text-amber-600 font-medium">● Wijzigingen niet opgeslagen</span>
                ) : (
                  <span className="text-green-600">✓ Alles opgeslagen</span>
                )}
              </div>
              <div className="flex gap-3">
                {hasChanges && (
                  <button
                    onClick={resetChanges}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  >
                    Annuleren
                  </button>
                )}
                <button
                  onClick={saveRelations}
                  disabled={!hasChanges || saving}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    hasChanges && !saving
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Opslaan...
                    </span>
                  ) : (
                    '💾 Opslaan'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-slate-500">Laden...</p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{posts.length}</div>
            <div className="text-sm text-slate-500">Totaal posts</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{selectedPost ? 1 : 0}</div>
            <div className="text-sm text-slate-500">Geselecteerd</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{selectedCount}</div>
            <div className="text-sm text-slate-500">Relaties</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
            <div className={`text-2xl font-bold ${hasChanges ? 'text-amber-600' : 'text-green-600'}`}>
              {hasChanges ? '●' : '✓'}
            </div>
            <div className="text-sm text-slate-500">{hasChanges ? 'Niet opgeslagen' : 'Opgeslagen'}</div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-slate-800 rounded-xl p-6 text-white">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span>💡</span> Hoe werkt het?
          </h3>
          <ol className="space-y-2 text-slate-300 text-sm">
            <li>1. Selecteer een blog post uit de dropdown</li>
            <li>2. Klik op posts in de linker kolom om ze als gerelateerd te markeren</li>
            <li>3. Bekijk je selectie in de rechter kolom</li>
            <li>4. Klik op &quot;Opslaan&quot; om de relaties op te slaan</li>
          </ol>
          <div className="mt-4 p-3 bg-slate-700 rounded-lg">
            <p className="text-slate-400 text-xs">
              <strong className="text-slate-200">Technische info:</strong> Deze tool schrijft direct naar de PostgreSQL database, 
              waardoor de Strapi v5 bug met self-referential relaties wordt omzeild.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
