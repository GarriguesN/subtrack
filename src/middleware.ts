import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://subtrack.nglab.es',
  'http://subtrack.nglab.es',
  'http://localhost:3000',
  undefined, // allow same-origin (no Origin header = same origin request)
];

export function middleware(request: NextRequest) {
  // Only protect /api/ routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Allow same-origin requests (no Origin header = same origin)
  if (!origin) {
    // Also check referer for extra safety on same-origin GET requests
    if (referer) {
      try {
        const refUrl = new URL(referer);
        if (refUrl.hostname === request.nextUrl.hostname) {
          return NextResponse.next();
        }
      } catch {}
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return NextResponse.next();
  }

  // Allow known origins
  if (ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.next();
  }

  // Block everything else
  return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = {
  matcher: '/api/:path*',
};
