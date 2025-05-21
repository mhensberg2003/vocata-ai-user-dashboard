# Vocata AI User Dashboard

A user dashboard for companies to manage their chatbots. This application allows users to:
- Authenticate with company email and password
- Manage their assigned chatbot
- View statistics and analytics
- Configure chatbot settings

Built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works fine)

### Setup Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. After your project is created, go to Settings > API to get your project URL and anon key
3. Create the following tables in your Supabase database:
   - Companies (id, name, created_at)
   - Chatbots (id, company_id, name, description, welcome_message, theme_color, language, widget_position, created_at)
   - Conversations (id, chatbot_id, started_at, ended_at, message_count)
   - Messages (id, conversation_id, content, is_bot, created_at)

### Setup Environment

1. Copy the environment example file:
   ```
   cp src/env.example .env.local
   ```
2. Update `.env.local` with your Supabase URL and anon key

### Install and Run

1. Install dependencies:
   ```
   npm install
   ```
2. Run the development server:
   ```
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) with your browser

## Authentication

The app uses Supabase authentication with email/password. 
In a production environment, you might want to set up additional auth providers like Google, GitHub, etc.

## Deployment

This app is ready to be deployed to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fvocata-ai-user-dashboard)
