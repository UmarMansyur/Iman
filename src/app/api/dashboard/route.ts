/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const factory_id = searchParams.get("factory_id") || "";

  try {
    // Total Produksi
    const total_produksi = await prisma.reportProduct.aggregate({
      where: {
        factory_id: Number(factory_id),
        created_at: {
          gte: new Date(new Date().getFullYear(), 0, 1), // Dari 1 Januari tahun ini
          lte: new Date(new Date().getFullYear(), 11, 31) // Sampai 31 Desember tahun ini
        }
      },
      _sum: {
        morning_shift_amount: true,
        afternoon_shift_amount: true,
      },
    });

    const total_production = (total_produksi?._sum?.morning_shift_amount ?? 0) + 
                           (total_produksi?._sum?.afternoon_shift_amount ?? 0);

    // Order Hari Ini
    const today_orders = await prisma.invoice.count({
      where: {
        factory_id: Number(factory_id),
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Mulai hari ini
          lte: new Date(new Date().setHours(23, 59, 59, 999)) // Sampai akhir hari ini
        }
      }
    });

    // Invoice Pending
    const pending_invoices = await prisma.invoice.count({
      where: {
        factory_id: Number(factory_id),
        payment_status: "Pending"
      }
    });

    // Pendapatan Bulan Ini
    const current_month_revenue = await prisma.invoice.aggregate({
      where: {
        factory_id: Number(factory_id),
        payment_status: {
          in: ["Paid", "Paid_Off"]
        },
        created_at: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Awal bulan ini
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // Akhir bulan ini
        }
      },
      _sum: {
        total: true
      }
    });

    return NextResponse.json({
      status: 200,
      data: {
        total_production: total_production,
        today_orders: today_orders,
        pending_invoices: pending_invoices,
        current_month_revenue: current_month_revenue._sum.total || 0
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      status: 400,
    });
  }
}
