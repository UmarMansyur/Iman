/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params } : { params: any}) {
  const param = await params;
  const id = param.id;

  const transaction = await prisma.transactionDistributor.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      buyer: true,
      location_distributor: true,
      payment_method: true,
      DetailTransactionDistributor: true,
      distributor: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  })

  return NextResponse.json(transaction);
}

export async function PUT(req: Request, { params } : { params: any}) {
  try {
    const param = await params;
    const id = param.id;
    
    // Ambil transaksi lama untuk mendapatkan invoice_code
    const oldTransaction = await prisma.transactionDistributor.findUnique({
      where: {
        id: Number(id)
      }
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
        id: Number(id)
      }
    });

    const body = await req.json();
    const {
      distributor_id,
      payment_method_id,
      buyer_name,
      buyer_address,
      factory_id,
      is_new_buyer,
      ppn,
      discount,
      cost,
      items,
      down_payment,
      remaining_balance,
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
          factory_id: Number(factory_id),
        },
      });

      buyer_id = newBuyer.id;

      // input data locationnya
      const newLocation = await prisma.locationDistributor.create({
        data: {
          name: buyer_name,
          cost: cost,
          distributor_id: Number(distributor_id),
          factory_id: Number(factory_id),
        },
      });

      location_distributor_id = newLocation.id;
    } else {
      const existBuyer = await prisma.buyerDistributor.findFirst({
        where: {
          name: buyer_name,
          distributor_id: Number(distributor_id),
          factory_id: Number(factory_id),
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
          factory_id: Number(factory_id),
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

    // Buat transaksi baru dengan invoice_code lama
    const transaction = await prisma.transactionDistributor.create({
      data: {
        invoice_code: invoiceCode, // Gunakan invoice_code lama
        distributor_id: Number(distributor_id),
        buyer_id,
        location_distributor_id,
        factory_id: Number(factory_id),
        payment_method_id: Number(payment_method_id),
        amount: totalAmount + Number(cost_delivery),
        ppn,
        cost_delivery: Number(cost_delivery),
        desc_delivery,
        down_payment: Number(down_payment),
        remaining_balance: Number(remaining_balance),
        discount,
        status_payment: "Pending",
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
              }) => ({
                desc: item.desc,
                amount: item.amount,
                price: item.price,
                discount: item.discount,
                sale_price: item.sale_price,
                is_product: item.is_product,
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

export async function DELETE(req: Request, { params } : { params: any}) {
  const param = await params;
  const id = param.id;

  const transaction = await prisma.transactionDistributor.findFirst({
    where: {
      id: Number(id)
    }
  });

  if (!transaction) {
    return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  await prisma.transactionDistributor.delete({
    where: {
      id: Number(id)
    }
  });

  return NextResponse.json({ message: "Transaksi berhasil dihapus" }, { status: 200 });
}
