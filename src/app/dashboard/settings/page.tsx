'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { chatbotApi } from '@/lib/api-client';
import { WidgetConfig } from '@/types/api';

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [settings, setSettings] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Get the current user
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
            
            // Fetch widget configuration
            try {
              const widgetConfig = await chatbotApi.getWidgetConfig(chatbotIdFromMetadata);
              setSettings(widgetConfig);
            } catch (apiError: any) {
              console.error('API error:', apiError);
              // If API is unavailable, use fallback data
              setSettings({
                logo_url: '',
                name: 'Company Helper',
                primary_color: '#6366F1',
                bubble_size: 'medium',
                position: 'right',
                greeting: 'Hello! How can I help you today?',
                theme: 'light',
                model: 'gpt-4o',
                temperature: 0.7,
                top_k: 3,
                use_query_expansion: true
              });
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

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (!settings) return;
    
    // Handle temperature as a number
    if (name === 'temperature') {
      setSettings(prev => prev ? {
        ...prev,
        [name]: parseFloat(value)
      } : null);
      return;
    }
    
    // Handle top_k as a number
    if (name === 'top_k') {
      setSettings(prev => prev ? {
        ...prev,
        [name]: parseInt(value, 10)
      } : null);
      return;
    }
    
    // Handle use_query_expansion as a boolean
    if (name === 'use_query_expansion') {
      setSettings(prev => prev ? {
        ...prev,
        [name]: value === 'true'
      } : null);
      return;
    }
    
    setSettings(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatbotId || !settings) {
      setError('No chatbot ID or settings available');
      return;
    }
    
    setIsSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      // Save the widget configuration using the API
      await chatbotApi.updateWidgetConfig(chatbotId, settings);
      setSaveSuccess(true);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
      
      // Hide success message after 3 seconds
      if (saveSuccess) {
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner-border text-indigo-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
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

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-yellow-100 p-4 rounded-md text-yellow-700">
            <p>No settings available for your chatbot</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chatbot Settings</h1>
        <p className="text-gray-500">Customize your chatbot's appearance and behavior</p>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">Settings saved successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 mt-4">
            <div>
              <label className="text-gray-700 font-medium" htmlFor="name">
                Chatbot Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={settings.name}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium" htmlFor="greeting">
                Welcome Message
              </label>
              <textarea
                id="greeting"
                name="greeting"
                value={settings.greeting}
                onChange={handleChange}
                rows={2}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium" htmlFor="primary_color">
                Theme Color
              </label>
              <div className="mt-2 flex items-center">
                <input
                  type="color"
                  id="primary_color"
                  name="primary_color"
                  value={settings.primary_color}
                  onChange={handleChange}
                  className="h-10 w-10 rounded-md border-gray-300"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={handleChange}
                  name="primary_color"
                  className="ml-2 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-medium" htmlFor="logo_url">
                Logo URL
              </label>
              <input
                type="text"
                id="logo_url"
                name="logo_url"
                value={settings.logo_url}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium" htmlFor="theme">
                Theme
              </label>
              <select
                id="theme"
                name="theme"
                value={settings.theme}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 font-medium" htmlFor="position">
                Widget Position
              </label>
              <select
                id="position"
                name="position"
                value={settings.position}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 font-medium" htmlFor="bubble_size">
                Bubble Size
              </label>
              <select
                id="bubble_size"
                name="bubble_size"
                value={settings.bubble_size}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-700 font-medium" htmlFor="model">
                    AI Model
                  </label>
                  <select
                    id="model"
                    name="model"
                    value={settings.model}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-gray-700 font-medium" htmlFor="temperature">
                    Temperature ({settings.temperature})
                  </label>
                  <input
                    type="range"
                    id="temperature"
                    name="temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature}
                    onChange={handleChange}
                    className="mt-2 block w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>More focused</span>
                    <span>More creative</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-700 font-medium" htmlFor="top_k">
                    Retrieved Documents
                  </label>
                  <select
                    id="top_k"
                    name="top_k"
                    value={settings.top_k}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="1">1</option>
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-gray-700 font-medium" htmlFor="use_query_expansion">
                    Query Expansion
                  </label>
                  <select
                    id="use_query_expansion"
                    name="use_query_expansion"
                    value={settings.use_query_expansion.toString()}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 