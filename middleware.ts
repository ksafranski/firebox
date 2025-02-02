import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Increase the body size limit for the ONIX analyzer endpoint
  if (request.nextUrl.pathname === '/api/onix-analyzer/analyze') {
    return NextResponse.next({
      request: {
        headers: new Headers({
          'x-middleware-next': '1',
          'content-length': '104857600', // 100MB in bytes
        }),
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/onix-analyzer/analyze',
}; 