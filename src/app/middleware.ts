import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const publicRoutes = ["/login"];
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

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  const session = await decrypt();

  if(session) {
    if (isProtectedRoute && !session?.userId) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (
      isPublicRoute &&
      session?.userId &&
      !req.nextUrl.pathname.startsWith("/dashboard")
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  
    return NextResponse.next();

  } else {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
