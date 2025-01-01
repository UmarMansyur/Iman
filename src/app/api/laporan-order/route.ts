/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { DeliveryTrackingStatus } from "@prisma/client";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const user_id = searchParams.get("user_id") || "";
    const skip = (page - 1) * limit;
    const factory_id = searchParams.get("factory_id") || "";
    const status_delivery = searchParams.get("status_delivery") || "" as DeliveryTrackingStatus
    const start_date = searchParams.get("start_date") || "";
    const end_date = searchParams.get("end_date") || "";


    const where: any = {
      OR: [
        { buyer: { name: { contains: search } } },
        { invoice_code: { contains: search } }
      ],
      user_id: user_id ? parseInt(user_id) : undefined,
      type_preorder: true,
    };

    if(status_delivery) {
      where.deliveryTracking = {
        status: status_delivery
      }
    }

    if(start_date && end_date) {
      where.created_at = {
        gte: new Date(new Date(start_date).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(end_date).setHours(23, 59, 59, 999))
      }
    }

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
