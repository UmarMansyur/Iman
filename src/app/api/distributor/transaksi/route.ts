/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { TransactionDistributorStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      distributor_id,
      payment_method_id,
      buyer_name,
      buyer_address,
      ppn,
      discount,
      cost,
      items,
      down_payment,
      cost_delivery,
      desc_delivery,
    } = body;


    let buyer_id: number;
    let location_distributor_id: number;

    const existBuyer = await prisma.buyerDistributor.findFirst({
      where: {
        name: buyer_name,
        distributor_id: Number(distributor_id),
      },
    });

    if (!existBuyer) {
      const newBuyer = await prisma.buyerDistributor.create({
        data: {
          name: buyer_name,
          address: buyer_address,
          distributor_id: Number(distributor_id),
        },
      });

      buyer_id = newBuyer.id;

      // input data locationnya
      const newLocation = await prisma.locationDistributor.create({
        data: {
          name: buyer_address,
          cost: cost,
          distributor_id: Number(distributor_id),
        },
      });

      location_distributor_id = newLocation.id;
    } else {
      buyer_id = existBuyer.id;

      const existLocation = await prisma.locationDistributor.findFirst({
        where: {
          name: buyer_address,
          distributor_id: Number(distributor_id),
        },
      });

      if (!existLocation) {
        return NextResponse.json(
          { message: "Location tidak ditemukan" },
          { status: 400 }
        );
      }

      location_distributor_id = existLocation.id;
    }

    // Hitung total amount
    const totalAmount = items.reduce(
      (
        acc: number,
        item: { amount: number; price: number; discount: number }
      ) => {
        // discount ini masih persentase
        return (
          acc + (item.amount * item.price - (item.price * item.discount) / 100)
        );
      },
      0
    );

    let invoiceCode = `INV-${new Date().getFullYear()}-${
      new Date().getMonth() + 1
    }-${Math.floor(100000 + Math.random() * 900000)}`;

    let checkInvoiceCode = await prisma.transactionDistributor.findFirst({
      where: {
        invoice_code: invoiceCode,
      },
    });

    while (checkInvoiceCode) {
      invoiceCode = `INV-${new Date().getFullYear()}-${
        new Date().getMonth() + 1
      }-${Math.floor(100000 + Math.random() * 900000)}`;
      checkInvoiceCode = await prisma.transactionDistributor.findFirst({
        where: {
          invoice_code: invoiceCode,
        },
      });
    }

    // status payment berubah menjadi Paid Off ketika melebihi total amount atau sama dengan total amount
    let status_payments = "Pending";
    if (Number(down_payment) >= (totalAmount + Number(cost_delivery))) {
      status_payments = "Paid_Off";
    }

    const remaining_balance = totalAmount + Number(cost_delivery) - Number(down_payment);

    // Buat transaksi
    const transaction = await prisma.transactionDistributor.create({
      data: {
        invoice_code: invoiceCode,
        distributor_id: Number(distributor_id),
        buyer_id,
        location_distributor_id,
        payment_method_id: Number(payment_method_id),
        amount: totalAmount + Number(cost_delivery),
        ppn,
        cost_delivery: Number(cost_delivery),
        desc_delivery,
        down_payment: Number(down_payment),
        remaining_balance: Number(remaining_balance),
        discount,
        status_payment: status_payments as TransactionDistributorStatus,
        status_delivery: "Process",
        DetailTransactionDistributor: {
          createMany: {
            data: items.map(
              (item: {
                product_id: any;
                desc: any;
                amount: any;
                price: any;
                discount: any;
                sale_price: any;
                is_product: any;
              }) => ({
                desc: item.desc,
                amount: item.amount,
                price: item.price,
                discount: item.discount,
                sale_price: item.sale_price,
                is_product: item.is_product,
                product_id: item.is_product ? Number(item.product_id) : null,
              })
            ),
          },
        },
      },
      include: {
        DetailTransactionDistributor: true,
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

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
    
    const where: any = {
      distributor_id: parseInt(distributor_id),
    };

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

    if (search) {
      where.OR = [
        {
          invoice_code: {
            contains: search,
          },
        },
      ];
    }

    const transactions = await prisma.transactionDistributor.findMany({
      where,
      include: {
        Factory: true,
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
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
