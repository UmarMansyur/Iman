import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { buyer: { contains: search } },
          { recipient: { contains: search } },
        ],
        payment_status: {
          in: ["Paid", "Paid_Off"],
        },
      },
      include: {
        factory: true,
        user: true,
        detailInvoices: {
          include: {
            product: true,
          },
        },
        payment_method: true,
        deliveryTracking: true,
      },
      take: limit,
      skip: skip,
      orderBy: {
        created_at: "desc",
      },
    });

    const total = await prisma.invoice.count({
      where: {
        OR: [
          { buyer: { contains: search } },
          { recipient: { contains: search } },
        ],
      },
    });

    return NextResponse.json({
      status: "success",
      data: invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch invoices",
      },
      { status: 500 }
    );
  }
}
