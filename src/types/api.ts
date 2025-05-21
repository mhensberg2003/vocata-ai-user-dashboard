/**
 * API Types
 */

export interface WidgetConfig {
  logo_url: string;
  name: string;
  primary_color: string;
  bubble_size: string;
  position: string;
  greeting: string;
  theme: "light" | "dark";
  model: string;
  temperature: number;
  top_k: number;
  use_query_expansion: boolean;
}

export interface Chatbot {
  id: string | number;
  name: string;
  status: string;
  system_prompt?: string;
  widget_config: WidgetConfig;
}

export interface KnowledgeSource {
  id: string | number;
  chatbot_id: string | number;
  type: "Document" | "Website";
  name: string;
  content?: string;
  processing_status: "pending" | "processing" | "completed" | "failed";
  processing_start_time?: string;
  processing_end_time?: string;
  processing_message?: string;
}

export interface SearchResult {
  chunk_id: string | number;
  content: string;
  similarity: number;
  metadata: {
    source: string;
    source_type: string;
    title: string;
    chunk_id: string;
    chunk_total: number;
    crawled_at: string;
    [key: string]: any;
  };
  chunking_strategy: string;
}

export interface ChatResponse {
  answer: string;
  sources: {
    chunk_id: string | number;
    content: string;
    source: string;
    title: string;
  }[];
}

// Stats interfaces

export interface MessageStats {
  date: string;
  count: number;
}

export interface TopQuestion {
  question: string;
  count: number;
}

export interface ChatbotStats {
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  dailyUsage: MessageStats[];
  topQuestions: TopQuestion[];
}

// Error interfaces

export interface ApiError {
  status: number;
  detail: string;
} 