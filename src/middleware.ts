import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create a new response
  let response = NextResponse.next();
  
  // Create supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    // Check for the auth cookie directly
    const authCookie = request.cookies.get('sb-visofzxxsopgczddjxol-auth-token');
    
    if (!authCookie || !authCookie.value) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Only protect dashboard routes
export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
}; 