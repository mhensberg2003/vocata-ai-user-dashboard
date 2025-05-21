'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ragApi, chatbotApi } from '@/lib/api-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    content: string;
    source: string;
    title: string;
  }[];
}

export default function ChatTest() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [chatbotName, setChatbotName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
              
              // Add welcome message
              setMessages([
                {
                  role: 'assistant',
                  content: chatbot.widget_config.greeting || 'Hello! How can I help you today?'
                }
              ]);
            } catch (apiError: any) {
              console.error('API error:', apiError);
              // If API is unavailable, use mock data
              setChatbotName('Demo Chatbot');
              setMessages([
                {
                  role: 'assistant',
                  content: 'Hello! I\'m a demo chatbot. How can I help you today?'
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
    
    fetchChatbotInfo();
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatbotId || !input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      const response = await ragApi.testChat(chatbotId, userMessage);
      
      // Add bot response to chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: response.answer,
          sources: response.sources
        }
      ]);
    } catch (err: any) {
      console.error('Error getting chat response:', err);
      
      // Add error message to chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while processing your request. Please try again later.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner-border text-indigo-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading chatbot...</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Test Your Chatbot</h1>
        <p className="text-gray-500">Try out your chatbot to see how it performs</p>
        {chatbotName && (
          <p className="text-gray-700 mt-1">Testing: <span className="font-medium">{chatbotName}</span></p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Chat Interface */}
        <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-[600px]">
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-indigo-100 text-gray-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 font-medium">Sources:</p>
                        <div className="mt-1 space-y-1">
                          {message.sources.map((source, i) => (
                            <div key={i} className="text-xs text-gray-600">
                              <p className="font-medium">{source.title}</p>
                              <p className="text-gray-500 truncate">{source.source}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
        
        {/* Testing tips */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Testing Tips</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 mr-2 flex-shrink-0">1</span>
              <span>Ask questions relevant to your knowledge sources to test retrieval accuracy.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 mr-2 flex-shrink-0">2</span>
              <span>Test different phrasings of the same question to check robustness.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 mr-2 flex-shrink-0">3</span>
              <span>Try asking about topics not in your knowledge base to evaluate out-of-scope handling.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 mr-2 flex-shrink-0">4</span>
              <span>The chatbot will show sources it used to generate answers when available.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 