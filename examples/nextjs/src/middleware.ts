import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { list } from './mock/library';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const firstLibrary = list[0];
    if (!firstLibrary) return NextResponse.next();
    return NextResponse.redirect(new URL(`/library/${firstLibrary.id}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
