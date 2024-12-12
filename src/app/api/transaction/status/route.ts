/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  if (!id) {
    return NextResponse.json(
      { status: "error", message: "ID tidak ditemukan" },
      { status: 404 }
    );
  }

  if (!status) {
    return NextResponse.json(
      { status: "error", message: "Status tidak ditemukan" },
      { status: 404 }
    );
  }

  const statusEnum = ["Pending", "Paid", "Paid_Off", "Failed", "Cancelled"];
  if (!statusEnum.includes(status)) {
    return NextResponse.json(
      { status: "error", message: "Status tidak valid" },
      { status: 400 }
    );
  }

  // await tx.stockProduct.createMany({
  //   data: detailInvoices.map((detail: any) => ({
  //     product_id: detail.product_id,
  //     amount: detail.amount,
  //     type: "Out",
  //   })),
  // });
  try {
    const invoices = await prisma.invoice.findFirst({
      include: {
        detailInvoices: true,
      },
      where: { id: parseInt(id) },
    });

    if (!invoices) {
      return NextResponse.json(
        { status: "error", message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: { payment_status: status as PaymentStatus },
    });

    if(status === "Paid_Off") {
      await prisma.logOrderDistributor.create({
        data: {
          invoice_id: parseInt(id),
          desc: "Operator telah mengubah status pembayaran menjadi lunas",
        },
      });
    }

    if(status === "Paid") {
      await prisma.logOrderDistributor.create({
        data: {
          invoice_id: parseInt(id),
          desc: "Operator telah mengubah status pembayaran menjadi dibayar",
        },
      });
    }

    if(status === "Failed") {
      await prisma.logOrderDistributor.create({
        data: {
          invoice_id: parseInt(id),
          desc: "Operator telah mengubah status pembayaran menjadi gagal",
        },
      });
    }

    if(status === "Cancelled") {
      await prisma.logOrderDistributor.create({
        data: {
          invoice_id: parseInt(id),
          desc: "Operator telah mengubah status pembayaran menjadi dibatalkan",
        },
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Transaksi berhasil dibuat",
      data: invoices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
