/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { DeliveryTrackingStatus } from "@prisma/client";
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

  const statusEnum = ["Pending", "Process", "Done", "Cancel"];
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
        deliveryTracking: true,
      },
      where: { id: parseInt(id) },
    });

    const currentStatus = invoices!.deliveryTracking[0]?.status
    if(currentStatus === status) {
      return NextResponse.json(
        { status: "error", message: "Status pengiriman sudah diatur sebelumnya" },
        { status: 400 }
      );
    }
    
    if(currentStatus === "Done") {
      return NextResponse.json(
        { status: "error", message: "Status pengiriman sudah selesai" },
        { status: 400 }
      );
    }

    if (!invoices) {
      return NextResponse.json(
        { status: "error", message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.deliveryTracking.updateMany({
      where: { invoice_id: parseInt(id) },
      data: { status: status as DeliveryTrackingStatus },
    });

    if(status === "Process") {
      await prisma.logOrderDistributor.create({
        data: {
          invoice_id: parseInt(id),
          desc: "Operator telah mengubah status pengiriman menjadi proses",
        },
      });


      const existingProduct = await prisma.product.findMany({
        where: {
          name: {
            in: invoices.detailInvoices.map((detail: any) => detail.desc),
          },
        },
      });
      const datas: any[] = [];
      existingProduct.forEach((product: any) => {
        datas.push({
          product_id: product.id,
          amount: invoices.detailInvoices.find((detail: any) => detail.desc === product.name)?.amount,
        });
      });

      if(datas.length > 0) {
        await prisma.stockProduct.createMany({
          data: datas.map((data: any) => ({
            product_id: data.product_id,
            amount: data.amount,
          })),
        });
      }

    }

    if(status === "Done") {
      await prisma.logOrderDistributor.create({
        data: {
          invoice_id: parseInt(id),
          desc: "Operator telah mengubah status pengiriman menjadi selesai",
        },
      });
    }

    if(status === "Cancel") {
      await prisma.logOrderDistributor.create({
        data: {
          invoice_id: parseInt(id),
          desc: "Operator telah mengubah status pengiriman menjadi dibatalkan",
        },
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Status pengiriman berhasil diubah",
      data: invoices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
