/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { status, sales_name, desc } = await req.json();
  try {
    if (!status) {
      throw new Error("Status tidak boleh kosong");
    }
    if (!sales_name) {
      throw new Error("Nama Pengirim tidak boleh kosong");
    }
    if (!desc) {
      throw new Error("Keterangan tidak boleh kosong");
    }

    const response = await prisma.$transaction(async (tx) => {
      const invoice = await tx.deliveryTracking.updateMany({
        where: { invoice_id: Number(params.id) },
        data: { status: status, sales_man: sales_name, desc: desc },
      });

      const detailInvoice = await tx.detailInvoice.findMany({
        where: { invoice_id: Number(params.id), is_product: true },
      });

      if (detailInvoice.length > 0) {
        const productStock = await tx.stockProduct.groupBy({
          by: ["product_id"],
          where: {
            product_id: {
              in: detailInvoice
                .map((item) => item.product_id)
                .filter((item) => item !== null),
            },
            type: "In",
          },

          _sum: {
            amount: true,
          },
        });

        const outProductStock = await tx.stockProduct.groupBy({
          by: ["product_id"],
          where: {
            product_id: {
              in: detailInvoice
                .map((item) => item.product_id)
                .filter((item) => item !== null),
            },
            type: "Out",
          },

          _sum: {
            amount: true,
          },
        });
        // Calculate stock for each product by subtracting Out from In amounts
        const stocks = productStock.map((inStock) => {
          const outStock = outProductStock.find(
            (out) => out.product_id === inStock.product_id
          );
          const inAmount = inStock._sum.amount || 0;
          const outAmount = outStock?._sum.amount || 0;
          return {
            product_id: inStock.product_id,
            amount: inAmount - outAmount,
          };
        });

        // jika ada stok product yang kurang dari jumlah detailInvoice
        detailInvoice.map((item) => {
          const stock = stocks.find(
            (stock) => stock.product_id === item.product_id
          );
          if (stock && stock.amount < item.amount) {
            throw new Error(
              `Stok product ${item.product_id} kurang dari jumlah ${item.amount}`
            );
          }
        });

        await tx.stockProduct.createMany({
          data: stocks.map((item) => ({
            product_id: item.product_id,
            amount: item.amount,
            type: "Out",
            invoice_id: Number(params.id),
          })),
        });
      }

      return invoice;
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
