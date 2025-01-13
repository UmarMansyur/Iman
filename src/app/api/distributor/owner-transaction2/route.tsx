/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    if (!req.url) {
      return NextResponse.json({ message: "URL tidak valid" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const distributor_id = searchParams.get("distributor_id") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const filterPayment = searchParams.get("filterPayment") || "";
    const filterStatus = searchParams.get("filterStatus") || "";

    // Sesuaikan dengan field yang ada di schema
    const availableSort = [
      "id",
      "created_at",
      "invoice_code",
      "amount",
      "status_payment",
      "status_delivery",
    ];

    
    if (!availableSort.includes(sortBy)) {
      return NextResponse.json(
        { message: "Sort by tidak valid" },
        { status: 400 }
      );
    }
    
    const where: any = {};

    if(filterStatus == 'all' || filterStatus == "") {
      delete where.status_payment;
    } else {
      where.status_payment = filterStatus;
    }

    if(filterPayment == 'all' || filterPayment == "") {
      delete where.payment_method_id;
    } else {
      where.payment_method_id = Number(filterPayment);
    }

    const FactoryDistributor = await prisma.factoryDistributor.findFirst({
      where: {
        MemberDistributor: {
          some: {
            user_id: parseInt(distributor_id),
          },
        },
      },
    });

    if (!FactoryDistributor) {
      return NextResponse.json(
        { message: "Anda tidak memiliki akses ke data ini" },
        { status: 403 }
      );
    }

    const members = await prisma.memberDistributor.findMany({
      where: {
        factory_distributor_id: FactoryDistributor.id,
      },
    });

    const member_ids = members.map((member) => member.user_id);


    if (search) {
      where.OR = [
        {
          invoice_code: {
            contains: search,
          },
        },
      ];
    }
    
    if(distributor_id) {
      where.distributor_id = {
        in: member_ids,
      }
    }


    const transactions = await prisma.transactionDistributor.findMany({
      where,
      include: {
        buyer: true,
        location_distributor: true,
        payment_method: true,
        DetailTransactionDistributor: {
          include: {
            Product: {
              include: {
                factory: true,
              },
            },
          },
        },
        distributor: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        [sortBy]: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.transactionDistributor.count({
      where,
    });

    return NextResponse.json({
      data: transactions,
      data_distributor: FactoryDistributor,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}