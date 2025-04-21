/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const body = await req.json();
  const { 
    status,
    buyer_address,
    discount,
    member_discount,
    delivery_location,
    delivery_cost 
  } = body;

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
    const result = await prisma.$transaction(async (tx) => {
      const invoices = await tx.invoice.findFirst({
        include: {
          detailInvoices: true,
        },
        where: { id: parseInt(id) },
      });

      if (!invoices) {
        throw new Error("Invoice tidak ditemukan");
      }

      const currentStatus = invoices.payment_status;

      if(currentStatus === status) {
        throw new Error("Status pembayaran sudah diatur sebelumnya");
      }

      if(currentStatus === "Paid_Off") {
        throw new Error("Status pembayaran sudah lunas");
      }

      if(currentStatus === "Cancelled") {
        throw new Error("Status pembayaran sudah dibatalkan");
      }

      const invoicesNew = await tx.invoice.update({
        where: { id: parseInt(id) },
        data: { 
          payment_status: status as PaymentStatus,
          buyer_address: buyer_address ? buyer_address as string : undefined,
          discount: discount ? Number(discount as string) : undefined,
          discon_member: member_discount ? Number(member_discount as string) : undefined
        },
      });

      if (status === "Paid" || status === "Paid_Off") {
        const deliveryTracking = await tx.deliveryTracking.findFirst({
          where: { invoice_id: parseInt(id) },
        });
        
        const newDeliveryTracking = await tx.deliveryTracking.update({
          where: { id: deliveryTracking?.id },
          data: {
            location: delivery_location ? delivery_location as string : undefined,
            cost: delivery_cost ? delivery_cost as number : undefined,
          }
        });

        const totalAmount = invoicesNew.total + (newDeliveryTracking.cost ?? 0) - (invoicesNew.discount ?? 0) - (invoicesNew.discon_member ?? 0);
        await tx.invoice.update({
          where: { id: parseInt(id) },
          data: { total: totalAmount },
        });
      }

      if(status === "Paid_Off") {
        await tx.invoice.update({
          where: { id: parseInt(id) },
          data: { remaining_balance: 0 },
        });
        await tx.logOrderDistributor.create({
          data: {
            invoice_id: parseInt(id),
            desc: "Operator telah mengubah status pembayaran menjadi lunas",
          },
        });
      }

      if(status === "Paid") {
        await tx.logOrderDistributor.create({
          data: {
            invoice_id: parseInt(id),
            desc: "Operator telah mengubah status pembayaran menjadi dibayar",
          },
        });
      }

      if(status === "Failed") {
        await tx.logOrderDistributor.create({
          data: {
            invoice_id: parseInt(id),
            desc: "Operator telah mengubah status pembayaran menjadi gagal",
          },
        });
      }

      if(status === "Cancelled") {
        await tx.logOrderDistributor.create({
          data: {
            invoice_id: parseInt(id),
            desc: "Operator telah mengubah status pembayaran menjadi dibatalkan",
          },
        });
      }

      return invoices;
    });

    return NextResponse.json({
      status: "success",
      message: "Status pembayaran berhasil diubah",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
