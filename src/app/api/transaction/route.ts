/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      factory_id,
      user_id,
      discount,
      buyer,
      sales_man,
      recipient,
      maturity_date,
      buyer_address,
      down_payment,
      payment_method_id,
      ppn,
      discon_member,
      item_amount,
      sub_total,
      total,
      remaining_balance,
      payment_status,
      detailInvoices,
      desc,
      cost,
      location,
    } = body;

    // inv tahun-bulan-id
    const invoice_code =
      "INV-" +
      new Date().getFullYear() +
      "-" +
      (new Date().getMonth() + 1) +
      "-" +
      Math.floor(100000 + Math.random() * 900000).toString();
    let amount_total = 0;
    detailInvoices.forEach((detail: any) => {
      amount_total += detail.sub_total;
    });

    const response = await prisma.$transaction(async (tx) => {
      // Create invoice with related records
      const invoice = await tx.invoice.create({
        data: {
          factory_id: parseInt(factory_id),
          user_id: parseInt(user_id),
          invoice_code,
          amount: amount_total,
          discount,
          ppn,
          buyer,
          sales_man,
          recipient,
          maturity_date: new Date(maturity_date),
          item_amount,
          discon_member,
          buyer_address,
          down_payment,
          total,
          sub_total,
          remaining_balance,
          payment_status: payment_status as PaymentStatus,
          payment_method_id: parseInt(payment_method_id),
          detailInvoices: {
            createMany: {
              data: detailInvoices.map((detail: any) => ({
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
        include: {
          detailInvoices: true,
        },
      });
      await tx.deliveryTracking.create({
        data: {
          invoice_id: invoice.id,
          desc: desc,
          location: location,
          cost,
        },
      });
    });

    return NextResponse.json({
      status: "success",
      message: "Transaksi berhasil dibuat",
      data: response,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to create invoice",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { buyer: { contains: search } },
          { recipient: { contains: search } },
        ],
      },
      include: {
        factory: true,
        user: true,
        detailInvoices: {
          include: {
            product: true,
          },
        },
        payment_method: true,
        deliveryTracking: true,
      },
      take: limit,
      skip: skip,
      orderBy: {
        created_at: "desc",
      },
    });

    const total = await prisma.invoice.count({
      where: {
        OR: [
          { buyer: { contains: search } },
          { recipient: { contains: search } },
        ],
      },
    });

    return NextResponse.json({
      status: "success",
      data: invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch invoices",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "ID tidak ditemukan" },
      { status: 400 }
    );
  }
  try {
    await prisma.invoice.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Invoice berhasil dihapus" },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Invoice gagal dihapus" },
      { status: 500 }
    );
  }
}
