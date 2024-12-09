'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from './lib/session';
 
// 1. Specify protected and public routes
const protectedRoutes = ['/owner/dashboard', '/owner/produk', '/owner/bahan-baku', '/owner/manajemen-operator', '/owner/laporan-bahan-baku', '/owner/laporan-produksi', '/owner/data-pembelian', '/owner/data-penjualan', '/owner/data-stok', '/owner/data-pengeluaran', '/owner/data-keuangan', '/admin/dashboard']
const publicRoutes = ['/login', '/signup', '/']
 
export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
 
  const session = await getSession();


  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (
    isPublicRoute &&
    session &&
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