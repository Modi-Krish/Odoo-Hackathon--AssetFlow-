import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware — Route Protection
 *
 * Runs on every request BEFORE the page renders.
 * Unauthenticated users are redirected to /login for all protected routes.
 * This prevents protected page JS bundles from being served to unauthenticated users.
 */

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/login', '/signup'];

// Prefixes that are always public (Next.js internals, static files)
const PUBLIC_PREFIXES = ['/_next/', '/favicon', '/api/auth/login', '/api/auth/signup', '/api/health'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public paths through
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route);
  const isPublicPrefix = PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (isPublicRoute || isPublicPrefix) {
    return NextResponse.next();
  }

  // Check for auth token — stored in localStorage by the frontend,
  // mirrored to a cookie called 'assetflow_token' by the client on login.
  const tokenCookie = request.cookies.get('assetflow_token');

  if (!tokenCookie?.value) {
    // No token — redirect to login with the original destination as a query param
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists — allow the request through.
  // Full JWT verification happens on the backend for every API call.
  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files and Next.js internals
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)',
  ],
};
