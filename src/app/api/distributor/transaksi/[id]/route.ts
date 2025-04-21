/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { TransactionDistributorStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: any }) {
  const param = await params;
  const id = param.id;



  const transaction = await prisma.transactionDistributor.findUnique({
    where: {
      invoice_code: id,
    },
    include: {
      buyer: true,
      location_distributor: true,
      payment_method: true,
      DetailTransactionDistributor: {
        include: {
          Product: true
        }
      },
      distributor: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  });

  const data_distributor = await prisma.factoryDistributor.findFirst({
    where: {
      MemberDistributor: {
        some: {
          user_id: transaction?.distributor_id,
        },
      },
    },
  });

  return NextResponse.json({ transaction, data_distributor });
}

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const param = await params;
    const id = param.id;

    // Ambil transaksi lama untuk mendapatkan invoice_code
    const oldTransaction = await prisma.transactionDistributor.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!oldTransaction) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus transaksi lama
    await prisma.transactionDistributor.delete({
      where: {
        id: Number(id),
      },
    });

    const body = await req.json();
    const {
      distributor_id,
      payment_method_id,
      buyer_name,
      buyer_address,
      is_new_buyer,
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

    // check dulu apakan buyer ada atau tidak
    if (is_new_buyer) {
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
      const existBuyer = await prisma.buyerDistributor.findFirst({
        where: {
          name: buyer_name,
          distributor_id: Number(distributor_id),
        },
      });
      if (!existBuyer) {
        return NextResponse.json(
          { message: "Buyer tidak ditemukan" },
          { status: 400 }
        );
      }

      buyer_id = existBuyer.id;

      const existLocation = await prisma.locationDistributor.findFirst({
        where: {
          name: buyer_name,
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

    // Gunakan invoice_code dari transaksi lama
    const invoiceCode = oldTransaction.invoice_code;

    // status payment berubah menjadi Paid Off ketika melebihi total amount atau sama dengan total amount
    let status_payments = "Pending";
    if (Number(down_payment) >= (totalAmount + Number(cost_delivery))) {
      status_payments = "Paid_Off";
    }

    const remaining_balance = totalAmount + Number(cost_delivery) - Number(down_payment);

    // Buat transaksi baru dengan invoice_code lama
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
                desc: any;
                amount: any;
                price: any;
                discount: any;
                sale_price: any;
                is_product: any;
                product_id: any;
              }) => ({
                desc: item.desc,
                amount: item.amount,
                price: item.price,
                discount: item.discount,
                sale_price: item.sale_price,
                is_product: item.is_product,
                product_id: item.is_product ? item.product_id : null,
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

export async function DELETE(req: Request, { params }: { params: any }) {
  const param = await params;
  const id = param.id;

  const transaction = await prisma.transactionDistributor.findFirst({
    where: {
      id: Number(id),
    },
  });

  if (!transaction) {
    return NextResponse.json(
      { message: "Transaksi tidak ditemukan" },
      { status: 404 }
    );
  }

  const response = await prisma.$transaction(async (tx) => {
    const transactionDistributor = await tx.transactionDistributor.delete({
      where: {
        id: Number(id),
      },
    });
    return { transactionDistributor };
  });
  return NextResponse.json(
    { message: "Transaksi berhasil dihapus", data: response },
    { status: 200 }
  );
}
