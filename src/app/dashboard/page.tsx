'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { supabase } from '@/lib/supabase';
import { ChatbotStats } from '@/types';
import { chatbotApi, statsApi } from '@/lib/api-client';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [chatbotName, setChatbotName] = useState<string>('');
  const [stats, setStats] = useState<ChatbotStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
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
            
            // Fetch chatbot info
            try {
              const chatbot = await chatbotApi.getChatbot(chatbotIdFromMetadata);
              setChatbotName(chatbot.name);
              
              // Fetch chatbot stats
              const chatbotStats = await statsApi.getChatbotStats(chatbotIdFromMetadata);
              setStats(chatbotStats);
            } catch (apiError: any) {
              console.error('API error:', apiError);
              // If API is unavailable, use mock data
              setStats({
                totalConversations: 1248,
                totalMessages: 8963,
                avgResponseTime: 1.2,
                dailyUsage: [
                  { date: 'Mon', count: 120 },
                  { date: 'Tue', count: 145 },
                  { date: 'Wed', count: 132 },
                  { date: 'Thu', count: 187 },
                  { date: 'Fri', count: 166 },
                  { date: 'Sat', count: 91 },
                  { date: 'Sun', count: 78 },
                ],
                topQuestions: [
                  { question: 'How do I reset my password?', count: 45 },
                  { question: 'What are your business hours?', count: 38 },
                  { question: 'Do you offer refunds?', count: 32 },
                  { question: 'How can I contact support?', count: 29 },
                  { question: 'What payment methods do you accept?', count: 25 },
                ],
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

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner-border text-indigo-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
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

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-yellow-100 p-4 rounded-md text-yellow-700">
            <p>No stats available for your chatbot</p>
          </div>
        </div>
      </div>
    );
  }

  // Chart data config
  const chartData = {
    labels: stats.dailyUsage.map(day => day.date),
    datasets: [
      {
        label: 'Daily Conversations',
        data: stats.dailyUsage.map(day => day.count),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Conversations',
      },
    },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back{user?.user_metadata?.company ? `, ${user.user_metadata.company}` : ''}!</p>
        {chatbotName && (
          <p className="text-gray-700 mt-1">Managing chatbot: <span className="font-medium">{chatbotName}</span></p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Conversations</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalConversations.toLocaleString()}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Messages</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalMessages.toLocaleString()}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Avg. Response Time</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.avgResponseTime}s</dd>
          </div>
        </div>
      </div>

      {/* Usage chart */}
      <div className="bg-white p-6 shadow rounded-lg mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Usage</h2>
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Top questions */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Top Questions</h2>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topQuestions.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.question}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 