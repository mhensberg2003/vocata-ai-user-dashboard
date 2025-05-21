'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Chatbot() {
  const [isLoading, setIsLoading] = useState(true);
  const [chatbotId, setChatbotId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [widgetPreview, setWidgetPreview] = useState(false);

  useEffect(() => {
    // In a real app, we'd fetch the user's chatbot info from Supabase here
    const fetchChatbotInfo = async () => {
      // Mock data
      setChatbotId('vocata-chatbot-12345');
      setIsLoading(false);
    };
    
    fetchChatbotInfo();
  }, []);

  const embedCode = `<script>
  window.vocataConfig = {
    chatbotId: "${chatbotId}",
    position: "right", // or "left"
  };
</script>
<script src="https://cdn.vocata.ai/widget.js" async></script>`;

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chatbot Integration</h1>
        <p className="text-gray-500">Add your chatbot to your website</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Embed Code Section */}
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
                You can customize the widget by changing the <code className="bg-gray-50 px-1 rounded">position</code> value in the embed code.
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