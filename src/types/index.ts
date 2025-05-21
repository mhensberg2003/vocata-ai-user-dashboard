export interface User {
  id: string;
  email: string;
  company: string;
  createdAt: Date;
  chatbotId: string;
}

export interface ChatbotStats {
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  dailyUsage: {
    date: string;
    count: number;
  }[];
  topQuestions: {
    question: string;
    count: number;
  }[];
}

export interface ChatbotSettings {
  id: string;
  name: string;
  description: string;
  welcomeMessage: string;
  themeColor: string;
  language: string;
  widgetPosition: 'left' | 'right';
} 