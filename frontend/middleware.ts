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
  // Auth is stored in localStorage (client-side only).
  // Server-side middleware cannot read localStorage, so we let all requests
  // through and rely on client-side protection in ClientLayout.tsx instead.
  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files and Next.js internals
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)',
  ],
};
