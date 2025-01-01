/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { TypeDistributor } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const { id, status_delivery } = await req.json();
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
      const products = existInvoice.DetailTransactionDistributor.filter(
        (item) => item.is_product && item.product_id !== null
      );
      let distributorStock;
      if (status_delivery === "Sent") {
        distributorStock = await tx.distributorStock.createMany({
          data: products.map((item) => ({
            product_id: item.product_id as number,
            amount: item.amount || 0,
            type: TypeDistributor.Out,
            desc: existInvoice.desc_delivery || "",
            distributor_id: existInvoice.distributor_id,
            factory_id: existInvoice.factory_id,
            invoice_code: existInvoice.invoice_code,
          })),
        });
      }

      const transactionDistributor = await tx.transactionDistributor.update({
        where: {
          id: Number(id),
        },
        data: {
          status_delivery: status_delivery,
        },
      });

      return {
        distributorStock,
        transactionDistributor,
      };
    });

    return NextResponse.json(
      {
        message: "Berhasil merubah status pengiriman",
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
