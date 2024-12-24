/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { uploadFile } from "@/lib/imagekit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const file = body.proof_of_payment as File;

    let fileUrl = null;
    if (file) {
      const fileObject = {
        buffer: Buffer.from(await file.arrayBuffer()),
        originalname: file.name,
        mimetype: file.type,
      };
      fileUrl = await uploadFile(fileObject);
    }

    const response = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          id: body.user_id,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const isExistBuyer = await tx.buyer.findFirst({
        where: {
          name: user.username,
          factory_id: body.factory_id,
        },
      });

      let buyerId: any = isExistBuyer?.id;
      if (!isExistBuyer) {
        const newBuyer = await tx.buyer.create({
          data: {
            name: user.username,
            address: user.address,
            factory_id: body.factory_id,
          },
        });
        buyerId = newBuyer.id;
      }

      const newOrder = await tx.invoice.create({
        data: {
          buyer_id: buyerId,
          factory_id: parseInt(body.factory_id),
          user_id: parseInt(body.user_id),
          is_distributor: true,
          payment_method_id: parseInt(body.payment_method_id),
          total: parseFloat(body.total) - parseFloat(body.down_payment),
          down_payment: parseFloat(body.down_payment),
          invoice_code:
            "INV-" +
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15),
          item_amount: body.detail_invoices.length,
          payment_status: "Pending",
          sub_total: parseFloat(body.sub_total),
          notes: body.notes,
          type_preorder: true,
          proof_of_payment: fileUrl,
          remaining_balance:
            parseFloat(body.total) - parseFloat(body.down_payment),
          detailInvoices: {
            createMany: body.detail_invoices.map((item: any) => ({
              product_id: item.product_id,
              amount: item.jumlah,
              desc: item.desc,
              discount: item.diskon,
              price: item.harga,
              sub_total: item.total_harga,
            })),
          },
        },
      });

      return newOrder;
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

