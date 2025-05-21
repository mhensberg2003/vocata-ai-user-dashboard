import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";

export default async function Home() {
  // In a real implementation, you'd check authentication state here
  // and redirect to dashboard if already logged in
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Vocata AI</h1>
          <div className="space-x-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
            >
              Register
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Manage Your Vocata AI Chatbot
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Access your company dashboard to manage your chatbot, view statistics, and configure settings.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/login"
                className="px-5 py-3 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Vocata AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
