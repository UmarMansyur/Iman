/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { uploadFile } from "@/lib/imagekit";
import { DeliveryTrackingStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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
    const location = data.get("location");
    const desc = data.get("desc");
    const latitude = data.get("latitude");
    const longitude = data.get("longitude");
    const cost = data.get("cost");
    const status = data.get("status");
    const bukti_pembayaran = data.get("file") as File;
    const detail_invoices = data.get("detail_invoices");

    // Validasi data wajib
    if (!factory_id || !user_id || !amount || !buyer || !payment_method_id) {
      return NextResponse.json(
        { 
          status: "error",
          message: "Data tidak lengkap" 
        }, 
        { status: 400 }
      );
    }

    // Handle upload file jika ada
    let fileUrl = "";
    if (bukti_pembayaran) {
      try {
        const fileObject = {
          buffer: Buffer.from(await bukti_pembayaran.arrayBuffer()),
          originalname: bukti_pembayaran.name,
          mimetype: bukti_pembayaran.type,
        };
        fileUrl = await uploadFile(fileObject);
      } catch (error: any) {
        return NextResponse.json(
          {
            status: "error", 
            message: error.message || "Gagal mengupload file"
          },
          { status: 400 }
        );
      }
    }

    // Generate kode invoice
    const invoice_code = `INV-${new Date().getFullYear()}-${
      new Date().getMonth() + 1
    }-${Math.floor(100000 + Math.random() * 900000)}`;

    // Hitung total amount
    const detail_invoices_array = JSON.parse(detail_invoices as string);
    const amount_total = detail_invoices_array.reduce(
      (acc: number, detail: any) => acc + detail.sub_total,
      0
    );

    // Proses transaksi database
    const response = await prisma.$transaction(async (tx) => {
      // Buat invoice
      const preOrder = await tx.invoice.create({
        data: {
          factory_id: Number(factory_id),
          user_id: Number(user_id),
          invoice_code,
          amount: Number(amount_total),
          buyer: buyer as string,
          sales_man: sales_man as string,
          recipient: recipient as string,
          maturity_date: new Date(maturity_date as string),
          item_amount: Number(item_amount),
          discon_member: Number(discon_member),
          buyer_address: buyer_address as string,
          down_payment: Number(down_payment),
          total: Number(total),
          sub_total: Number(sub_total),
          remaining_balance: Number(remaining_balance),
          payment_status: payment_status as PaymentStatus,
          payment_method_id: Number(payment_method_id),
          notes: notes as string,
          proof_of_payment: fileUrl,
          detailInvoices: {
            createMany: {
              data: detail_invoices_array.map((detail: any) => ({
                product_id: detail.product_id,
                desc: detail.desc,
                amount: detail.amount,
                price: detail.price,
                discount: detail.discount,
                sub_total: detail.sub_total,
              })),
            },
          },
        },
      });

      // Buat tracking delivery
      await tx.deliveryTracking.create({
        data: {
          invoice_id: preOrder.id,
          desc: desc as string,
          location: location as string,
          latitude: Number(latitude),
          longitude: Number(longitude),
          cost: Number(cost),
          status: status as DeliveryTrackingStatus,
        },
      });

      return preOrder;
    });

    return NextResponse.json({
      status: "success",
      message: "Pre-order berhasil dibuat",
      data: response,
    });

  } catch (error: any) {
    console.error("Error creating pre-order:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Gagal membuat pre-order",
      },
      { status: 500 }
    );
  }
}


