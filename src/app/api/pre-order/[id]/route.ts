/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { deleteFile, uploadFile } from "@/lib/imagekit";
import { DeliveryTrackingStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: any }) {
  const param = params.id;
  const id = Number(param);
  const data = await req.formData();
  const factory_id = data.get("factory_id");
  const user_id = data.get("user_id");
  const amount = data.get("amount");
  const buyer = data.get("buyer");
  const sales_man = data.get("sales_man");
  const recipient = data.get("recipient");
  const maturity_date = data.get("maturity_date");
  const item_amount = data.get("item_amount");  
  const discon_member = data.get("discon_member");
  const buyer_address = data.get("buyer_address");
  const down_payment = data.get("down_payment");
  const total = data.get("total");
  const sub_total = data.get("sub_total");
  const remaining_balance = data.get("remaining_balance");
  const payment_status = data.get("payment_status");
  const payment_method_id = data.get("payment_method_id");
  const notes = data.get("notes");
  const file = data.get("file") ? data.get("file") as File : null;
  const location = data.get("location");
  const desc = data.get("desc");
  const latitude = data.get("latitude");
  const longitude = data.get("longitude");
  const cost = data.get("cost");
  const status = data.get("status");
  const detail_invoices = data.get("detail_invoices");
 
  if (!id) {
    return NextResponse.json(
      { status: "error", message: "ID pre-order diperlukan" },
      { status: 400 }
    );
  }

  if (!factory_id || !user_id || !amount || !buyer || !payment_method_id) {
    return NextResponse.json(
      { status: "error", message: "Data yang diperlukan tidak lengkap" },
      { status: 400 }
    );
  }

  let fileUrl = "";
  if (file) {
    try {
      const existingPreOrder = await prisma.invoice.findUnique({
        where: { id: parseInt(id.toString()) },
      });
      if (existingPreOrder?.proof_of_payment) {
        await deleteFile(existingPreOrder.proof_of_payment);
      }
      const fileObject = {
        buffer: Buffer.from(await file.arrayBuffer()),
        originalname: file.name,
        mimetype: file.type,
      };
      fileUrl = await uploadFile(fileObject);
    } catch (error: any) {
      return NextResponse.json(
        { status: "error", message: "Gagal mengunggah file" },
        { status: 500 }
      );
    }
  }

  const detail_invoices_array = JSON.parse(detail_invoices as string);
  const amount_total = detail_invoices_array.reduce(
    (acc: number, detail: any) => acc + detail.sub_total,
    0
  );

  try {
    const response = await prisma.$transaction(async (tx) => {
      const existingPreOrder = await tx.invoice.findUnique({
        where: { id: parseInt(id.toString()) },
      });

      if (!existingPreOrder) {
        throw new Error("Pre-order tidak ditemukan");
      }

      const products = await tx.product.findMany({
        where: {
          id: {
            in: detail_invoices_array.map((detail: any) => detail.product_id)
          }
        }
      });

      const preOrder = await tx.invoice.update({
        where: { id: parseInt(id.toString()) },
        data: {
          factory_id: Number(factory_id),
          user_id: Number(user_id),
          amount: amount_total,
          buyer: buyer as string,
          sales_man: sales_man as string,
          recipient: recipient as string,
          maturity_date: new Date(maturity_date as string),
          item_amount: Number(item_amount as string),
          discon_member: Number(discon_member as string),
          buyer_address: buyer_address as string,
          down_payment: Number(down_payment as string),
          total: Number(total as string),
          sub_total: Number(sub_total as string),
          remaining_balance: Number(remaining_balance as string),
          payment_status: payment_status as PaymentStatus,
          payment_method_id: Number(payment_method_id),
          notes: notes as string,
          proof_of_payment: fileUrl || undefined,
          detailInvoices: {
            deleteMany: {},
            createMany: {
              data: detail_invoices_array.map((detail: any) => ({
                product_id: detail.product_id,
                desc: products.find((product: any) => product.id == detail.product_id)?.name,
                amount: detail.amount,
                price: detail.price,
                discount: detail.discount,
                sub_total: detail.sub_total,
              })),
            },
          },
        },
        include: {
          detailInvoices: true,
          deliveryTracking: true,
        },
      });

      if (location || desc || status) {
        await tx.deliveryTracking.updateMany({
          where: { invoice_id: preOrder.id },
          data: {
            desc: desc as string,
            location: location as string,
            latitude: Number(latitude as string),
            longitude: Number(longitude as string),
            cost: Number(cost as string),
            status: status as DeliveryTrackingStatus,
          },
        });
      }

      return preOrder;
    });

    return NextResponse.json({
      status: "success",
      message: "Pre-order berhasil diperbarui",
      data: response,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Gagal memperbarui pre-order",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, { params }: { params: any }) {
  const param = params.id;
  const id = Number(param);
  try {

    const preOrder = await prisma.invoice.findUnique({
      where: {
        id: parseInt(id.toString())
      },
      include: {
        detailInvoices: true,
        deliveryTracking: true,
        factory: true,
        payment_method: true,
        user: true
      }
    });

    if (!preOrder) {
      return NextResponse.json(
        { message: "Pre-order tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: preOrder
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Gagal mengambil data pre-order"
      },
      { status: 500 }
    );
  }
}
