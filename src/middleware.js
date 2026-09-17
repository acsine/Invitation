import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Handle /fr or /fr/* routes by rewriting to root or stripping /fr prefix
  if (pathname === '/fr' || pathname === '/fr/') {
    return NextResponse.rewrite(new URL('/', request.url));
  }

  if (pathname.startsWith('/fr/')) {
    const targetPath = pathname.replace(/^\/fr/, '') || '/';
    return NextResponse.rewrite(new URL(targetPath, request.url));
  }

  // Handle CORS for mobile API
  if (pathname.startsWith('/api/mobile')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/fr',
    '/fr/:path*',
    '/api/mobile/:path*'
  ],
};
