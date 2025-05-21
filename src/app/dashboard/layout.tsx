'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { signOut } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { BarChart2, Settings, MessageSquare, LogOut, Menu, X, Database } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/login');
    }
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: BarChart2 },
    { name: 'Chatbot', href: '/dashboard/chatbot', icon: MessageSquare },
    { name: 'Knowledge', href: '/dashboard/knowledge', icon: Database },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-2 border-b">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
            <h1 className="text-xl font-bold">Vocata AI</h1>
          </div>
        </div>

        {isOpen && (
          <div className="bg-white border-b">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    ${pathname === item.href ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                    group flex items-center px-2 py-2 text-base font-medium rounded-md
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={`
                      ${pathname === item.href ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                      mr-4 flex-shrink-0 h-6 w-6
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full text-left group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold">Vocata AI</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    ${pathname === item.href ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  `}
                >
                  <item.icon
                    className={`
                      ${pathname === item.href ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                      mr-3 flex-shrink-0 h-6 w-6
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={handleSignOut}
              className="group flex w-full items-center py-2 px-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
} 