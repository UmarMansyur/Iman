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
          by: ["product_id", "type"],
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

        const dataProduct = await tx.product.findMany({
          where: { id: { in: detailInvoice.map((item) => item.product_id).filter((item) => item !== null) } },
        });

        detailInvoice.map((item) => {
          const stockIn = productStock.find(
            (stock) => stock.product_id === item.product_id && stock.type === "In"
          )?._sum.amount || 0;
          const stockOut = productStock.find(
            (stock) => stock.product_id === item.product_id && stock.type === "Out"
          )?._sum.amount || 0;

          const stock = (stockIn - stockOut) / 200;

          if (stock < item.amount) {
            const exist = dataProduct.find((p) => p.id === item.product_id);
            throw new Error(
              `Stok product ${exist?.name + " " + exist?.type || ""} tidak mencukupi`
            );
          }
        });


        await tx.stockProduct.createMany({
          data: detailInvoice.map((item) => ({
            product_id: Number(item.product_id),
            amount: item.amount * (dataProduct.find((p: any) => p.id === item.product_id)?.per_bal || 200),
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
