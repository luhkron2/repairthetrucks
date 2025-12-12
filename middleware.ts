import { auth } from './auth';
import { NextResponse } from 'next/server';
// no explicit type to allow NextAuth to augment request with auth

const rateLimit = new Map<string, { count: number; resetTime: number }>();
function isRateLimited(ip: string, limit = 50, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);
  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (record.count >= limit) {
    return true;
  }
  record.count++;
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (pathname.startsWith('/api/')) {
    if (isRateLimited(ip, 50, 60000)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/report', '/login', '/api/issues', '/api/upload', '/api/mappings'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    // But if it's POST /api/issues (public submission), allow it
    if (pathname === '/api/issues' && req.method === 'POST') {
      return NextResponse.next();
    }
    if (pathname.startsWith('/thanks/')) {
      return NextResponse.next();
    }
    if (!isLoggedIn && !pathname.startsWith('/login')) {
      // Allow public access
      return NextResponse.next();
    }
  }

  // Protected routes
  const protectedRoutes = ['/workshop', '/operations', '/schedule', '/issues', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  const role = req.auth?.user?.role;

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based gates to keep drivers out of staff areas
  if (role === 'DRIVER' && isProtectedRoute) {
    return NextResponse.redirect(new URL('/report', req.url));
  }

  if (pathname.startsWith('/operations')) {
    if (role !== 'OPERATIONS' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/workshop', req.url));
    }
  }

  if (pathname.startsWith('/workshop')) {
    if (role !== 'WORKSHOP' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/operations', req.url));
    }
  }

  if (pathname.startsWith('/schedule') || pathname.startsWith('/issues')) {
    if (role !== 'WORKSHOP' && role !== 'OPERATIONS' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Admin-only routes
  if (pathname.startsWith('/admin')) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/workshop', req.url));
    }
  }

  const response = NextResponse.next();
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self' blob:",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);
  if (isProtectedRoute) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$|favicon.ico).*)'],
};

