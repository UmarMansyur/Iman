/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { DeliveryTrackingStatus, PaymentStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const user_id = searchParams.get("user_id") || "";
    const skip = (page - 1) * limit;
    const type_preorder = searchParams.get("type_preorder") || "";
    const status_delivery = searchParams.get("status_delivery") || ("" as DeliveryTrackingStatus);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const filterPayment = searchParams.get("filterPayment") || "";
    const filterStatus = searchParams.get("filterStatus") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const factory_id = searchParams.get("factory_id") || "";



    const where: any = {
      OR: [
        { buyer: { name: { contains: search } } },
        { invoice_code: { contains: search } },
      ],
      // user_id: user_id ? parseInt(user_id) : undefined,
      // type_preorder: type_preorder === "1" ? true : false,
    };
    if(type_preorder === "true" || type_preorder === "1") {
      where.type_preorder = true;
    } else if(type_preorder === "false" || type_preorder === "0") {
      where.type_preorder = false;
    } else {
      delete where.type_preorder;
    }

    if(factory_id == 'other') {
      where.factory_id = null;
    } else if(factory_id == 'all') {
      delete where.factory_id;
    } else if(factory_id != '') {
      where.factory_id = parseInt(factory_id);
    } else {
      delete where.factory_id;
    }


    const memberDistributor = await prisma.factoryDistributor.findFirst({
      where: {
        MemberDistributor: {
          some: {
            user_id: parseInt(user_id),
          },
        },
      },
    });

    if(!memberDistributor) {
      return NextResponse.json({ message: "Member distributor tidak ditemukan" }, { status: 400 });
    }

    const members = await prisma.memberDistributor.findMany({
      where: {
        factory_distributor_id: memberDistributor.id,
      },
    });

    const userIds = members.map((member) => member.user_id);

    if (userIds.length > 0) {
      where.user_id = {
        in: userIds,
      };
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

    if (filterPayment === "") {
      delete where.payment_method_id;
    } else if (filterPayment == "all") {
      delete where.payment_method_id;
    } else {
      where.payment_method_id = Number(filterPayment);
    }
    if (filterStatus === "") {
      delete where.payment_status;
    } else if (filterStatus === "all") {
      where.payment_status = {
        in: [
          PaymentStatus.Pending,
          PaymentStatus.Paid,
          PaymentStatus.Paid_Off,
          PaymentStatus.Failed,
          PaymentStatus.Cancelled,
          PaymentStatus.Unpaid,
        ],
      };
    } else if (filterStatus === "Pending") {
      where.payment_status = PaymentStatus.Pending;
    } else if (filterStatus === "Paid") {
      where.payment_status = PaymentStatus.Paid;
    } else if (filterStatus === "Paid_Off") {
      where.payment_status = PaymentStatus.Paid_Off;
    } else if (filterStatus === "Failed") {
      where.payment_status = PaymentStatus.Failed;
    } else if (filterStatus === "Cancelled") {
      where.payment_status = PaymentStatus.Cancelled;
    } else if (filterStatus === "Unpaid") {
      where.payment_status = PaymentStatus.Unpaid;
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