/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, getSession } from './lib/session';
import { jwtDecode } from 'jwt-decode';

const protectedRoutes = [
  '/',
  "/admin/dashboard",
  "/admin/pengguna",
  "/admin/pabrik",
  "/admin/satuan",
  "/admin/bahan-baku",
  "/admin/satuan-bahan-baku",
  "/admin/hak-akses",
  "/admin/setting/payment",
  "/admin/setting/account",
  "/owner",
  "/owner/bahan-baku",
  "/owner/persediaan-bahan-baku",
  "/owner/bahan-baku-produksi",
  "/owner/produk",
  "/owner/stok-produk",
  "/owner/laporan-produksi",
  "/owner/data-order",
  "/owner/manajemen-operator",
  "/operator/dashboard",
  "/operator/persediaan-bahan-baku",
  "/operator/bahan-baku-produksi",
  "/operator/stok-produk",
  "/operator/laporan-produksi",
  "/operator/data-order",
  "/operator/transaksi",
  "/operator/pengiriman",
  "/distributor/dashboard",
  "/distributor/pre-order",
  "/distributor/data-order",
  "/distributor/konfirmasi-penerimaan",
];
const publicRoutes = ['/login', '/signup']
 
export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
  const session = await getSession();

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublicRoute && session) {
    // next saja
    if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup')) {
      return NextResponse.next();

    }
  }
  if (session) {
    try {
      const decoded: any = jwtDecode(session);
      if (req.nextUrl.pathname.startsWith('/owner') && !req.nextUrl.pathname.startsWith('/owner-distributor')) {
        if(!decoded?.factory_selected?.position.includes("Owner") || decoded?.factory_selected?.status_member !== "Active"){
          deleteSession();
          return NextResponse.redirect(new URL('/401', req.nextUrl));
        } else {
          return NextResponse.next();
        }
      }
      if(req.nextUrl.pathname.startsWith("/operator")) {
        if(!decoded?.factory_selected?.position.includes("Operator") || decoded?.factory_selected?.status_member !== "Active"){
          deleteSession();
          return NextResponse.redirect(new URL('/401', req.nextUrl));
        } else {
          return NextResponse.next();
        }
      }
      if(req.nextUrl.pathname.startsWith("/distributor")) {
        if(!decoded?.factory_selected?.position.includes("Distributor") || decoded?.factory_selected?.status_member !== "Active"){
          deleteSession();
          return NextResponse.redirect(new URL('/401', req.nextUrl));
        } else {
          return NextResponse.next();
        }
      }
      if(req.nextUrl.pathname.startsWith("/owner-distributor")) {
        if(!decoded?.factory_selected?.position.includes("Owner Distributor") || decoded?.factory_selected?.status_member !== "Active"){
          deleteSession();
          return NextResponse.redirect(new URL('/401', req.nextUrl));
        } else {
          return NextResponse.next();
        }
      }
    } catch (error: any) {
      return NextResponse.redirect(new URL('/login', req.nextUrl))
    }
  }
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}