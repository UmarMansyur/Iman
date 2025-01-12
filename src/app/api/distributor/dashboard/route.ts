/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const factory_id = searchParams.get("factory_id");
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

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

    const totalPreOrder = await prisma.invoice.count({
      where: {
        user_id: {
          in: distributors?.MemberDistributor.map((member) =>
            Number(member.user_id)
          ),
        },
        ...where,
      },
    });

    const totalTransaction = await prisma.transactionDistributor.count({
      where: {
        distributor_id: {
          in: distributors?.MemberDistributor.map((member) => Number(member.user_id)),
        },
        ...where,
      },
    });

    const orderPending = await prisma.invoice.count({
      where: {
        user_id: {
          in: distributors?.MemberDistributor.map((member) => Number(member.user_id)),
        },
        payment_status: "Pending",
        ...where,
      },
    });

    const orderSuccess = await prisma.invoice.aggregate({
      where: {
        user_id: {
          in: distributors?.MemberDistributor.map((member) => Number(member.user_id)),
        },
        payment_status: {
          in: ["Paid", "Paid_Off"],
        },
        ...where,
      },
      _count: {
        total: true,
      },
    });

    return NextResponse.json({
      status: 200,
      data: {
        total_preorder: totalPreOrder,
        total_transaction: totalTransaction,
        order_pending: orderPending,
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
