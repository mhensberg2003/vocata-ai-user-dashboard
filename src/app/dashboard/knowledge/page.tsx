'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { knowledgeSourceApi } from '@/lib/api-client';
import { KnowledgeSource } from '@/types/api';

export default function KnowledgeSources() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [isSubmittingWebsite, setIsSubmittingWebsite] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('sources');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if we have a session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          setError("No active session");
          setIsLoading(false);
          return;
        }
        
        // Get user data if session exists
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
          
          // Check if user has a chatbot assigned in metadata
          const chatbotIdFromMetadata = data.user?.user_metadata?.chatbotId;
          if (chatbotIdFromMetadata) {
            setChatbotId(chatbotIdFromMetadata);
            
            try {
              // Fetch knowledge sources
              const sourcesData = await knowledgeSourceApi.getAllSources(chatbotIdFromMetadata);
              setSources(sourcesData);
            } catch (apiError: any) {
              console.error('API error:', apiError);
              // If API is unavailable, use mock data
              setSources([
                {
                  id: 'mock-1',
                  chatbot_id: chatbotIdFromMetadata,
                  type: 'Document',
                  name: 'FAQ Document',
                  processing_status: 'completed',
                  processing_start_time: '2023-10-01T14:30:00Z',
                  processing_end_time: '2023-10-01T14:35:00Z'
                },
                {
                  id: 'mock-2',
                  chatbot_id: chatbotIdFromMetadata,
                  type: 'Website',
                  name: 'Company Website',
                  processing_status: 'completed',
                  processing_start_time: '2023-10-02T10:15:00Z',
                  processing_end_time: '2023-10-02T10:25:00Z'
                }
              ]);
            }
          } else {
            setError("No chatbot assigned to this user");
          }
        }
      } catch (err) {
        console.error('Error fetching session or user:', err);
        setError("Error loading user data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatbotId || !newDocName || !docContent) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmittingDoc(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await knowledgeSourceApi.createDocumentSource(
        chatbotId,
        newDocName,
        docContent
      );
      
      setSources(prev => [...prev, result]);
      setSuccess('Document added successfully! Processing may take a few minutes.');
      
      // Reset form
      setNewDocName('');
      setDocContent('');
      setActiveTab('sources');
    } catch (err: any) {
      console.error('Error adding document:', err);
      setError(err.message || 'Failed to add document');
    } finally {
      setIsSubmittingDoc(false);
      
      // Clear success message after 5 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 5000);
      }
    }
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatbotId || !websiteUrl) {
      setError('Please enter a website URL');
      return;
    }
    
    setIsSubmittingWebsite(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await knowledgeSourceApi.createWebsiteSource(
        chatbotId,
        websiteUrl
      );
      
      setSources(prev => [...prev, result]);
      setSuccess('Website crawling started! This process may take several minutes.');
      
      // Reset form
      setWebsiteUrl('');
      setActiveTab('sources');
    } catch (err: any) {
      console.error('Error adding website:', err);
      setError(err.message || 'Failed to add website');
    } finally {
      setIsSubmittingWebsite(false);
      
      // Clear success message after 5 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 5000);
      }
    }
  };

  const handleDeleteSource = async (sourceId: string | number) => {
    if (!sourceId) return;
    
    setIsDeleting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await knowledgeSourceApi.deleteSource(sourceId.toString());
      setSources(prev => prev.filter(source => source.id !== sourceId));
      setSuccess('Knowledge source deleted successfully');
    } catch (err: any) {
      console.error('Error deleting source:', err);
      setError(err.message || 'Failed to delete knowledge source');
    } finally {
      setIsDeleting(false);
      
      // Clear success message after 5 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 5000);
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner-border text-indigo-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading knowledge sources...</p>
        </div>
      </div>
    );
  }

  if (error && !sources.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-md text-red-700">
            <p>{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
              onClick={() => window.location.href = '/login'}
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Sources</h1>
        <p className="text-gray-500">Manage the knowledge your chatbot can access</p>
      </div>

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('sources')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'sources'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Sources
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'document'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Document
            </button>
            <button
              onClick={() => setActiveTab('website')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'website'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Website
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* All Sources Tab */}
          {activeTab === 'sources' && (
            <div>
              {sources.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No knowledge sources added yet.</p>
                  <p className="text-gray-500 mt-2">
                    Add your first knowledge source by clicking on "Add Document" or "Add Website".
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sources.map((source) => (
                        <tr key={source.id.toString()}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {source.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {source.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(source.processing_status)}`}>
                              {source.processing_status.charAt(0).toUpperCase() + source.processing_status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(source.processing_start_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteSource(source.id)}
                              disabled={isDeleting}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Add Document Tab */}
          {activeTab === 'document' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Document Source</h3>
              <form onSubmit={handleAddDocument}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="document-name" className="block text-sm font-medium text-gray-700">
                      Document Name *
                    </label>
                    <input
                      type="text"
                      id="document-name"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g. Product Manual"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="document-content" className="block text-sm font-medium text-gray-700">
                      Document Content *
                    </label>
                    <textarea
                      id="document-content"
                      rows={10}
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Paste your document text here..."
                      required
                    ></textarea>
                    <p className="mt-2 text-sm text-gray-500">
                      Paste the text content of your document. For best results, ensure the text is clean and well-formatted.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingDoc}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                      {isSubmittingDoc ? 'Adding...' : 'Add Document'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Add Website Tab */}
          {activeTab === 'website' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Website Source</h3>
              <form onSubmit={handleAddWebsite}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="website-url" className="block text-sm font-medium text-gray-700">
                      Website URL *
                    </label>
                    <input
                      type="url"
                      id="website-url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="https://example.com"
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Enter the URL of the website to crawl. We'll automatically crawl up to 10 pages starting from this URL.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingWebsite}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                      {isSubmittingWebsite ? 'Adding...' : 'Add Website'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 