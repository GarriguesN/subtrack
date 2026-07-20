import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://subtrack.nglab.es',
  'http://subtrack.nglab.es',
  'http://localhost:3000',
  'https://notes.nglab.es',
];

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Allow when no Origin and no Referer (server-side, curl, etc.)
  if (!origin && !referer) {
    return NextResponse.next();
  }

  // Check Origin header
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.next();
    }
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // No Origin but has Referer: check if it's our domain
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.hostname.endsWith('nglab.es') || refUrl.hostname === 'localhost') {
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

export const config = {
  matcher: '/api/:path*',
};
