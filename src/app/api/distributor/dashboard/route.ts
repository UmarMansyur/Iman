/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const factory_id = searchParams.get("factory_id");
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const user_id = searchParams.get("user_id");

  try {
    const where: any = {};

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    if (factory_id) {
      where.factory_id = Number(factory_id);
    }

    const distributors = await prisma.factoryDistributor.findFirst({
      where: {
        factoryId: Number(factory_id),
      },
      include: {
        MemberDistributor: true,
      },
    });

    const whereUserId: any = {}

    if(user_id) {
      whereUserId.user_id = Number(user_id);
    } else {
      whereUserId.user_id = {
        in: distributors?.MemberDistributor.map((member) =>
          Number(member.user_id)
        ),
      };
    }


    const totalPreOrder = await prisma.invoice.count({
      where: {
        type_preorder: true,
        ...where,
        ...whereUserId,
      },
    });

    const whereDistributor: any = {}

    if(user_id) {
      whereDistributor.distributor_id = Number(user_id);
    } else {
      whereDistributor.distributor_id = {
        in: distributors?.MemberDistributor.map((member) => Number(member.user_id)),
      };
    }

    const totalTransaction = await prisma.transactionDistributor.count({
      where: {
        ...whereDistributor,
      },
    });

    const orderPending = await prisma.invoice.count({
      where: {
        type_preorder: true,
        payment_status: "Pending",
        ...where,
        ...whereUserId,
      },
    });

    const orderSuccess = await prisma.invoice.aggregate({
      where: {
        payment_status: {
          in: ["Paid", "Paid_Off"],
        },
        type_preorder: true,
        ...where,
        ...whereUserId,
      },
      _count: {
        total: true,
      },
    });

    return NextResponse.json({
      status: 200,
      data: {
        total_preorder: totalPreOrder || 0,
        total_transaction: totalTransaction || 0,
        order_pending: orderPending || 0,
        order_success: orderSuccess._count.total || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: error.message,
    });
  }
}
