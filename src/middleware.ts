import { NextRequest, NextResponse } from 'next/server'
import { getSession } from './lib/token';
 
// 1. Specify protected and public routes
const protectedRoutes = ['/admin/dashboard', '/']
const publicRoutes = ['/login', '/signup', '/']
 
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
 
  const session = await getSession();

  if (isProtectedRoute && !session?.id) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (
    isPublicRoute &&
    session?.id &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    // isi nilai
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}