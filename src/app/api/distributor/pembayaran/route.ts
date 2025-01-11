/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const { id, status_payment, amount_payment } = await req.json();
  try {
    const existInvoice = await prisma.transactionDistributor.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        DetailTransactionDistributor: true,
      },
    });

    if (!existInvoice) throw new Error("Invoice tidak ditemukan");

    const response = await prisma.$transaction(async (tx) => {
      const data: any = {};
      if(amount_payment > 0 ) {
        data.status_payment = status_payment;
        data.remaining_balance = {
          decrement: amount_payment,
        };
      } else {
        data.status_payment = status_payment;
      }

      const transactionDistributor = await tx.transactionDistributor.update({
        where: {
          id: Number(id),
        },
        data,
      });

      return {
        transactionDistributor,
      };
    });

    return NextResponse.json(
      {
        message: "Berhasil merubah status pembayaran",
        data: response,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
