/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const body = await req.json();
  const status = body.status;
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

    const currentStatus = invoices.payment_status;

    if(currentStatus === status) {
      return NextResponse.json(
        { status: "error", message: "Status pembayaran sudah diatur sebelumnya" },
        { status: 400 }
      );
    }

    if(currentStatus === "Paid_Off") {
      return NextResponse.json(
        { status: "error", message: "Status pembayaran sudah lunas" },
        { status: 400 }
      );
    }

    if(currentStatus === "Cancelled") {
      return NextResponse.json(
        { status: "error", message: "Status pembayaran sudah dibatalkan" },
        { status: 400 }
      );
    }

    await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: { payment_status: status as PaymentStatus },
    });



    if(status === "Paid_Off") {
      await prisma.invoice.update({
        where: { id: parseInt(id) },
        data: { remaining_balance: 0 },
      });
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
      message: "Status pembayaran berhasil diubah",
      data: invoices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
