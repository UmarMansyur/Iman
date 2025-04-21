import prisma from "@/lib/db";
import { NextResponse } from "next/server";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET(request: Request, { params }: { params: any }) {
  try {
    const paramId = await params;
    const id = paramId.id;

    const invoice = await prisma.invoice.findFirst({
      where: { invoice_code: id },
      include: {
        payment_method: true,
        factory: true,
        deliveryTracking: {
          include: {
            location: true,
          }
        },
        user: true,
        detailInvoices: {
          include: {
            product: true,
          },
        },
        buyer: true,
      },
    });

    // Cek jika invoice tidak ditemukan
    if (!invoice) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: invoice }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}