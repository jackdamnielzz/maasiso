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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  
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
  const [postSearchTerm, setPostSearchTerm] = useState('');
  const [showPostSelector, setShowPostSelector] = useState(false);

  // Check if already authenticated (session storage with token verification)
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = sessionStorage.getItem('relatedPostsAuthToken');
      if (savedToken) {
        try {
          const response = await fetch('/api/admin-auth', {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          const data = await response.json();
          if (data.success) {
            setIsAuthenticated(true);
          } else {
            // Token invalid or expired, clear it
            sessionStorage.removeItem('relatedPostsAuthToken');
          }
        } catch {
          sessionStorage.removeItem('relatedPostsAuthToken');
        }
      }
      setAuthLoading(false);
    };
    verifyAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        setIsAuthenticated(true);
        sessionStorage.setItem('relatedPostsAuthToken', data.token);
        setPasswordInput('');
      } else {
        setAuthError(data.error || 'Onjuist wachtwoord');
        setPasswordInput('');
      }
    } catch {
      setAuthError('Kon niet verbinden met de server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('relatedPostsAuthToken');
    setSelectedPost('');
    setSelectedRelated(new Set());
  };

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
  
  // Sort posts alphabetically by title
  const sortedPosts = [...posts].sort((a, b) => a.title.localeCompare(b.title, 'nl'));
  
  // Filter posts for the post selector (with search)
  const filteredPostsForSelector = sortedPosts.filter(p =>
    postSearchTerm === '' ||
    p.title.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(postSearchTerm.toLowerCase())
  );
  
  // Filter posts for the selection list (exclude currently selected post)
  const availablePosts = sortedPosts.filter(p =>
    p.documentId !== selectedPost &&
    (searchTerm === '' ||
     p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCount = selectedRelated.size;
  const originalCount = currentRelated.length;

  // Reset to start page (deselect post)
  const resetToStart = () => {
    if (hasChanges) {
      if (!confirm('Je hebt onopgeslagen wijzigingen. Weet je zeker dat je terug wilt naar de beginpagina?')) {
        return;
      }
    }
    setSelectedPost('');
    setSelectedRelated(new Set());
    setCurrentRelated([]);
    setHasChanges(false);
    setSuccess(null);
    setError(null);
    setSearchTerm('');
    setPostSearchTerm('');
  };

  // Loading screen while checking authentication
  if (authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🔐</div>
          <p className="text-slate-400">Authenticatie controleren...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center py-8">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Related Posts Manager
              </h1>
              <p className="text-slate-600 text-sm">
                Voer het admin wachtwoord in om toegang te krijgen
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Wachtwoord
                </label>
                <input
                  type="password"
                  id="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="••••••••"
                  autoFocus
                  disabled={authLoading}
                />
              </div>
              
              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  ⚠️ {authError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={authLoading || !passwordInput}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                  authLoading || !passwordInput
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {authLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Inloggen...
                  </span>
                ) : (
                  'Inloggen'
                )}
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                🔒 Deze pagina is beveiligd. Alleen geautoriseerde gebruikers hebben toegang.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
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
            <div className="flex gap-2">
              {selectedPost && (
                <button
                  onClick={resetToStart}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  ← Terug naar begin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-2"
              >
                🚪 Uitloggen
              </button>
            </div>
          </div>
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

        {/* Post Selection - Improved with search and slug display */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            1. Selecteer een blog post:
          </label>
          
          {/* Selected post display or selector */}
          {selectedPost && selectedPostData ? (
            <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-blue-900 truncate">{selectedPostData.title}</p>
                <p className="text-sm text-blue-600 font-mono">/{selectedPostData.slug}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPost('');
                  setShowPostSelector(true);
                  setPostSearchTerm('');
                }}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Wijzig
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Zoek op titel of slug..."
                  value={postSearchTerm}
                  onChange={(e) => {
                    setPostSearchTerm(e.target.value);
                    setShowPostSelector(true);
                  }}
                  onFocus={() => setShowPostSelector(true)}
                  className="w-full p-4 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  disabled={loading}
                />
                {postSearchTerm && (
                  <button
                    onClick={() => setPostSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Dropdown list */}
              {showPostSelector && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  {filteredPostsForSelector.length > 0 ? (
                    <>
                      <div className="sticky top-0 bg-slate-100 px-4 py-2 text-xs text-slate-500 font-medium border-b">
                        {filteredPostsForSelector.length} posts gevonden (alfabetisch gesorteerd)
                      </div>
                      {filteredPostsForSelector.map((post) => (
                        <button
                          key={post.documentId}
                          onClick={() => {
                            setSelectedPost(post.documentId);
                            setShowPostSelector(false);
                            setPostSearchTerm('');
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-slate-400 mt-0.5">📄</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 truncate">{post.title}</p>
                              <p className="text-xs text-slate-500 font-mono truncate">/{post.slug}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center text-slate-500">
                      <p className="text-2xl mb-2">🔍</p>
                      <p>Geen posts gevonden voor &quot;{postSearchTerm}&quot;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Click outside to close */}
          {showPostSelector && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setShowPostSelector(false)}
            />
          )}
        </div>

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
            <li>1. Zoek en selecteer een blog post (alfabetisch gesorteerd, met slug zichtbaar)</li>
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
