/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { recipient, user_id, factory_id } = await req.json();
    const response = await prisma.invoice.findFirst({
      where: {
        id: parseInt(id || ""),
      },
      include: {
        detailInvoices: true,
        deliveryTracking: true,
      },
    });
  
    if(!response) {
      throw new Error("Invoice tidak ditemukan");
    }

    if(response.deliveryTracking[0]?.status === "Process") {
      throw new Error("Status pengiriman masih dalam proses, harap tunggu!");
    }
    if(response.deliveryTracking[0]?.status === "Done") {
      throw new Error("Status pengiriman sudah selesai");
    }
  
    const response2 = await prisma.deliveryTracking.updateMany({
      where: {
        invoice_id: parseInt(response?.id.toString() || ""),
      },
      data: {
        status: "Done",
        recipient: recipient,
      },
    });
  
    const response3 = await prisma.distributorStock.createMany({
      data: response?.detailInvoices?.map((detail: any) => ({
        product_id: parseInt(detail.product_id || ""),
        amount: parseFloat(detail.amount || ""),
        distributor_id: parseInt(user_id || ""),
        type: "In",
        desc: "Konfirmasi Penerimaan Order Invoice " + response?.invoice_code,
        factory_id: parseInt(factory_id || ""),
        invoice_id: parseInt(response?.id.toString() || ""),
      })),
    });
  
    if(response3.count === 0) {
      throw new Error("Gagal menambahkan stock");
    }
  
    return NextResponse.json({
      status: "success",
      message: "Status pengiriman berhasil diubah",
      data: response2,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message,
    }, { status: 500 });
  }
}
