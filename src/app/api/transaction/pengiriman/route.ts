/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const user_id = searchParams.get("user_id") || "";
    const skip = (page - 1) * limit;
    const factory_id = searchParams.get("factory_id") || "";
    const type_preorder = searchParams.get("type_preorder") || "";
    const where: any = {
      OR: [
        { buyer: { name: { contains: search } } },
        { invoice_code: { contains: search } }
      ],
      user_id: user_id ? parseInt(user_id) : undefined,
      type_preorder: type_preorder === "1" ? true : false,
    };



    if(factory_id) {
      where.factory_id = parseInt(factory_id);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        factory: true,
        user: true,
        detailInvoices: {
          include: {
            product: true,
          },
        },
        buyer: true,
        payment_method: true,
        deliveryTracking: {
          include: {
            location: true
          }
        }
      },
      take: limit,
      skip: skip,
      orderBy: {
        created_at: "desc",
      },
    });

    const total = await prisma.invoice.count({
      where,
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