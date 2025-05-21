'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { chatbotApi } from '@/lib/api-client';

export default function Chatbot() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [chatbotName, setChatbotName] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [widgetPreview, setWidgetPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatbotInfo = async () => {
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
              // Fetch chatbot info
              const chatbot = await chatbotApi.getChatbot(chatbotIdFromMetadata);
              setChatbotName(chatbot.name);
              
              // Fetch system prompt
              const promptData = await chatbotApi.getSystemPrompt(chatbotIdFromMetadata);
              setSystemPrompt(promptData.system_prompt || '');
            } catch (apiError: any) {
              console.error('API error:', apiError);
              // If API is unavailable, use mock data
              setChatbotName('Demo Chatbot');
              setSystemPrompt('You are a helpful customer support agent for our company. Be friendly, concise, and accurate. If you don\'t know the answer to a question, acknowledge that and offer to connect the user with a human agent.');
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
    
    fetchChatbotInfo();
  }, []);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSystemPrompt(e.target.value);
  };

  const handleSavePrompt = async () => {
    if (!chatbotId) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await chatbotApi.updateSystemPrompt(chatbotId, systemPrompt);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving system prompt:', err);
      setError(err.message || 'Failed to save system prompt');
    } finally {
      setIsSaving(false);
    }
  };

  const embedCode = chatbotId ? `<script>
  window.vocataConfig = {
    chatbotId: "${chatbotId}",
    position: "right", // or "left"
  };
</script>
<script src="https://cdn.vocata.ai/widget.js" async></script>` : '';

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const togglePreview = () => {
    setWidgetPreview(!widgetPreview);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner-border text-indigo-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading chatbot information...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
        <h1 className="text-2xl font-bold text-gray-900">Chatbot Configuration</h1>
        <p className="text-gray-500">Manage your chatbot's behavior and integration</p>
        {chatbotName && (
          <p className="text-gray-700 mt-1">Current chatbot: <span className="font-medium">{chatbotName}</span></p>
        )}
      </div>

      {/* System Prompt Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">System Prompt</h2>
        <p className="text-gray-600 mb-4">
          Define how your chatbot responds and behaves by customizing its system prompt.
        </p>
        
        {saveSuccess && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">System prompt saved successfully!</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <textarea
            value={systemPrompt}
            onChange={handlePromptChange}
            className="w-full h-48 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your system prompt here..."
          ></textarea>
        </div>
        
        <div className="flex justify-between items-center">
          <a 
            href="/dashboard/chatbot/test" 
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-1.5 0a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" clipRule="evenodd" />
              <path d="M10 7a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 010-2h.5V8a1 1 0 01.5-1z" />
            </svg>
            Test your chatbot
          </a>
          
          <button
            onClick={handleSavePrompt}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            {isSaving ? 'Saving...' : 'Save System Prompt'}
          </button>
        </div>
      </div>

      {/* Embed Code Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Embed Code</h2>
          <p className="text-gray-600 mb-4">
            Copy and paste this code into your website to add the chatbot widget.
          </p>
          
          <div className="relative">
            <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto mb-4">
              {embedCode}
            </pre>
            <button
              onClick={copyEmbedCode}
              className="absolute top-2 right-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300"
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">Your Chatbot ID</h3>
            <div className="flex items-center">
              <code className="bg-gray-50 px-3 py-2 rounded-md text-sm">{chatbotId}</code>
              <span className="ml-2 text-sm text-gray-500">
                (Use this ID if you need to contact support)
              </span>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
          <p className="text-gray-600 mb-4">
            See how your chatbot widget will appear on your website.
          </p>
          
          <div className="relative w-full h-64 bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
            <div className="h-full w-full flex items-center justify-center">
              {widgetPreview ? (
                <div className="absolute bottom-4 right-4 bg-indigo-600 text-white rounded-full shadow-lg h-12 w-12 flex items-center justify-center cursor-pointer hover:bg-indigo-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              ) : (
                <div className="text-gray-400">
                  Click the button below to show the widget preview
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={togglePreview}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
            >
              {widgetPreview ? 'Hide Widget' : 'Show Widget'}
            </button>
          </div>
        </div>

        {/* Integration Guide */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Integration Guide</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium text-gray-900">1. Copy the embed code</h3>
              <p className="text-gray-600">
                Click the Copy button above to copy the embed code to your clipboard.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900">2. Add the code to your website</h3>
              <p className="text-gray-600">
                Paste the embed code just before the closing <code className="bg-gray-50 px-1 rounded">&lt;/body&gt;</code> tag in your HTML.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900">3. Customize the widget</h3>
              <p className="text-gray-600">
                You can customize the widget appearance in the <a href="/dashboard/settings" className="text-indigo-600 hover:text-indigo-800">Settings</a> page.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900">4. Test your integration</h3>
              <p className="text-gray-600">
                After adding the code to your website, refresh the page and check if the chatbot widget appears.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 