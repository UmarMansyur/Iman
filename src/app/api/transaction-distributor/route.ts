/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeliveryTrackingStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

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
    const status_delivery =
      searchParams.get("status_delivery") || ("" as DeliveryTrackingStatus);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "desc";



    const where: any = {
      OR: [
        { buyer: { name: { contains: search } } },
        { invoice_code: { contains: search } },
      ],
      payment_status: {
        in: [PaymentStatus.Pending, PaymentStatus.Unpaid]
      },
    };
    if(type_preorder === "true" || type_preorder === "1") {
      where.type_preorder = true;
    } else if(type_preorder === "false" || type_preorder === "0") {
      where.type_preorder = false;
    } else {
      delete where.type_preorder;
    }

    if (user_id) {
      where.user_id = parseInt(user_id);
    }

    if (status_delivery) {
      where.deliveryTracking = {
        status: status_delivery,
      };
    }

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }


    if (factory_id) {
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
            location: true,
          },
        },
      },
      take: limit,
      skip: skip,
      orderBy: {
        [sortBy]: sortOrder,
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
