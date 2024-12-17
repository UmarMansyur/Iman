/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: any }
) {
  const { status, sales_name, desc, recipient, maturity_date } = await req.json();
  try {
    if (!status) {
      throw new Error("Status tidak boleh kosong");
    }

    if (!desc) {
      throw new Error("Keterangan tidak boleh kosong");
    }

    const paramId = await params;
    const id = parseInt(paramId.id);
    
    const response = await prisma.$transaction(async (tx) => {
      const updateBody: any = {
        status: status,
        sales_man: sales_name,
        desc: desc,
      }

      if(maturity_date) {
        await tx.invoice.update({
          where: { id: Number(id) },
          data: {
            maturity_date: new Date(maturity_date),
          }
        });
      }

      if(status === "Done") {
        updateBody.recipient = recipient;
      }

      const locationUpdate = await tx.deliveryTracking.findFirst({
        where: { invoice_id: Number(id) },
      })

      const invoice = await tx.deliveryTracking.update({
        where: { id: locationUpdate?.id },
        data: {
          cost: locationUpdate?.cost,
          ...updateBody
        },
      });


      if(status === "Cancel") {
        await tx.stockProduct.deleteMany({
          where: { invoice_id: Number(id) },
        });
      }

      const detailInvoice = await tx.detailInvoice.findMany({
        where: { invoice_id: Number(id), is_product: true },
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
            invoice_id: Number(id),
          })),
        });
      }

      return invoice;
    });

    return NextResponse.json({
      message: "Berhasil mengubah status pengiriman",
      data: response,
    });
  } catch (error: any) {

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
