/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: any }) {
  try {
    const paramId = await params;
    const id = paramId.id;

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        payment_method: true,
        factory: true,
        deliveryTracking: true,
        user: true,
        detailInvoices: {
          include: {
            product: true,
          },
        },
      },
    });

    // Cek jika invoice tidak ditemukan
    if (!invoice) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    invoice.buyer = invoice.user.username;

    return NextResponse.json({ data: invoice }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const paramId: any = await params;
    const id = paramId.id;
    const body = await req.json();

    // Validasi ID
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }


    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        buyer: body.buyer,
        sales_man: body.sales_man,
        recipient: body.recipient,
        maturity_date: new Date(body.maturity_date),
        buyer_address: body.buyer_address,
        down_payment: body.down_payment,
        payment_method_id: parseInt(body.payment_method_id),
        discon_member: body.discon_member,
        notes: body.notes,
        item_amount: body.item_amount,
        sub_total: body.sub_total,
        total: body.total,
        remaining_balance: body.remaining_balance,
        factory_id: body.factory_id,
        user_id: parseInt(body.user_id),
      },
    });

    // Hapus detail invoice yang lama
    await prisma.detailInvoice.deleteMany({
      where: { invoice_id: parseInt(id) },
    });

    // Buat detail invoice baru
    const detailInvoices = body.detailInvoices.map((detail: any) => ({
      invoice_id: parseInt(id),
      desc: detail.desc,
      amount: detail.amount,
      price: detail.price,
      discount: detail.discount,
      sub_total: detail.sub_total,
    }));

    await prisma.detailInvoice.createMany({
      data: detailInvoices,
    });


    await prisma.deliveryTracking.updateMany({
      where: { invoice_id: parseInt(id) },
      data: {
        cost: body.shipping_cost,
        desc: body.desc,
        location: body.shipping_address,
      },
    });


    return NextResponse.json(
      {
        message: "Invoice berhasil diupdate",
        data: updatedInvoice,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan saat mengupdate invoice" },
      { status: 500 }
    );
  }
}
