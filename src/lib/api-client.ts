/**
 * API Client for communicating with the Vocata AI backend
 */
import { supabase } from './supabase';

// Get API URL from environment variables (will be read from .env.local)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fallback API key from environment (only used if user doesn't have an assigned key)
const FALLBACK_API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

/**
 * Get the current user's API key from their metadata
 */
const getUserApiKey = async (): Promise<string> => {
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.user_metadata?.apiKey) {
      return data.user.user_metadata.apiKey;
    }
  } catch (err) {
    console.error('Error getting user API key:', err);
  }
  return FALLBACK_API_KEY;
};

/**
 * Base API request function with authentication
 */
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const apiKey = await getUserApiKey();
  
  const url = `${API_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Client-Key': apiKey
  };

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || `API request failed with status ${response.status}`
    );
  }

  return response.json();
}

/**
 * Chatbot API endpoints
 */
export const chatbotApi = {
  // Get all chatbots for the current user
  getAllChatbots: () => apiRequest<any[]>('/chatbots/'),
  
  // Get a specific chatbot by ID
  getChatbot: (id: string) => apiRequest<any>(`/chatbots/${id}`),
  
  // Update a chatbot
  updateChatbot: (id: string, data: any) => 
    apiRequest<any>(`/chatbots/${id}`, 'PUT', data),
  
  // Get chatbot widget configuration
  getWidgetConfig: (id: string) => 
    apiRequest<any>(`/chatbots/${id}/widget-config`),
  
  // Update chatbot widget configuration
  updateWidgetConfig: (id: string, config: any) => 
    apiRequest<any>(`/chatbots/${id}/widget-config`, 'PUT', config),
    
  // Get chatbot system prompt
  getSystemPrompt: (id: string) => 
    apiRequest<any>(`/chatbots/${id}/system-prompt`),
    
  // Update chatbot system prompt
  updateSystemPrompt: (id: string, prompt: string) => 
    apiRequest<any>(`/chatbots/${id}/system-prompt`, 'PUT', { system_prompt: prompt }),
};

/**
 * Knowledge Sources API endpoints
 */
export const knowledgeSourceApi = {
  // Get all knowledge sources for a chatbot
  getAllSources: (chatbotId: string) => 
    apiRequest<any[]>(`/knowledge-sources/?chatbot_id=${chatbotId}`),
  
  // Get a specific knowledge source
  getSource: (id: string) => 
    apiRequest<any>(`/knowledge-sources/${id}`),
  
  // Create a new document knowledge source
  createDocumentSource: (chatbotId: string, name: string, content: string, chunkingStrategy = 'hierarchical') => 
    apiRequest<any>('/knowledge-sources/', 'POST', {
      chatbot_id: chatbotId,
      type: 'Document',
      name,
      content,
      chunking_strategy: chunkingStrategy
    }),
  
  // Create a website crawler knowledge source
  createWebsiteSource: (chatbotId: string, url: string, maxPages = 10, maxDepth = 2) => 
    apiRequest<any>('/knowledge-sources/crawl-website', 'POST', {
      chatbot_id: chatbotId,
      url,
      max_pages: maxPages,
      max_depth: maxDepth,
      chunking_strategy: 'hierarchical',
      scrape_all_pages: false
    }),
  
  // Delete a knowledge source
  deleteSource: (id: string) => 
    apiRequest<any>(`/knowledge-sources/${id}`, 'DELETE'),
};

/**
 * RAG (Retrieval-Augmented Generation) API endpoints
 */
export const ragApi = {
  // Search through knowledge base
  search: (chatbotId: string, query: string, topK = 5) => 
    apiRequest<any>('/rag/search', 'POST', {
      chatbot_id: chatbotId,
      query,
      top_k: topK
    }),
  
  // Test a chat message with the chatbot
  testChat: (chatbotId: string, query: string) => 
    apiRequest<any>('/rag/chat', 'POST', {
      chatbot_id: chatbotId,
      query,
      top_k: 3,
      model: 'gpt-4o',
      temperature: 0.7
    }),
};

/**
 * Stats API endpoints
 */
export const statsApi = {
  // Get dashboard stats for a chatbot
  getChatbotStats: (chatbotId: string) => 
    apiRequest<any>(`/stats/chatbot/${chatbotId}`),
}; 