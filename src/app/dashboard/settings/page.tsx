'use client';

import { useState, useEffect } from 'react';
import { ChatbotSettings } from '@/types';
import { supabase } from '@/lib/supabase';

// Mock data - in a real app this would come from your Supabase database
const mockSettings: ChatbotSettings = {
  id: 'chatbot-123',
  name: 'Company Helper',
  description: 'A helpful assistant for customer support',
  welcomeMessage: 'Hello! How can I help you today?',
  themeColor: '#6366F1',
  language: 'en',
  widgetPosition: 'right',
};

export default function Settings() {
  const [settings, setSettings] = useState<ChatbotSettings>(mockSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // In a real app, we'd fetch the actual settings from Supabase here
    setIsLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      // In a real app, we'd save the settings to Supabase here
      // const { error } = await supabase
      //   .from('chatbots')
      //   .update(settings)
      //   .eq('id', settings.id);
      
      // if (error) throw error;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
    } catch (err: any) {
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chatbot Settings</h1>
        <p className="text-gray-500">Customize your chatbot's appearance and behavior</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

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
              <label className="text-gray-700 font-medium" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={settings.description}
                onChange={handleChange}
                rows={3}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium" htmlFor="welcomeMessage">
                Welcome Message
              </label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={settings.welcomeMessage}
                onChange={handleChange}
                rows={2}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium" htmlFor="themeColor">
                Theme Color
              </label>
              <div className="mt-2 flex items-center">
                <input
                  type="color"
                  id="themeColor"
                  name="themeColor"
                  value={settings.themeColor}
                  onChange={handleChange}
                  className="h-10 w-10 rounded-md border-gray-300"
                />
                <input
                  type="text"
                  value={settings.themeColor}
                  onChange={handleChange}
                  name="themeColor"
                  className="ml-2 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-medium" htmlFor="language">
                Language
              </label>
              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 font-medium" htmlFor="widgetPosition">
                Widget Position
              </label>
              <select
                id="widgetPosition"
                name="widgetPosition"
                value={settings.widgetPosition}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
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