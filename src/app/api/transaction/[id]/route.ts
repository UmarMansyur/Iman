/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { PaymentStatus } from "@prisma/client";
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
        buyer: true,
      },
    });

    // Cek jika invoice tidak ditemukan
    if (!invoice) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

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
    const {
      factory_id,
      buyer,
      user_id,
      discount,
      maturity_date,
      down_payment,
      payment_method_id,
      ppn,
      discon_member,
      item_amount,
      sub_total,
      notes,
      total,
      remaining_balance,
      payment_status,
      detailInvoices,
      desc,
      shipping_cost,
      shipping_address,
      is_distributor,
      buyer_address,
    } = body;
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

    const response = await prisma.$transaction(async (tx) => {
      let existingBuyer: any;
      let locations: any;
      if (is_distributor === "regular") {
        existingBuyer = await tx.buyer.findFirst({
          where: {
            name: buyer,
            factory_id: parseInt(factory_id),
          },
        });

        if (!existingBuyer) {
          await tx.buyer.create({
            data: {
              name: buyer,
              factory_id: parseInt(factory_id),
              address: buyer_address,
            },
          });
        }
        locations = await tx.location.findFirst({
          where: {
            name: shipping_address,
            factory_id: parseInt(factory_id),
          },
        });
        if (!locations) {
          locations = await tx.location.create({
            data: {
              name: shipping_address,
              factory_id: parseInt(factory_id),
              cost: shipping_cost,
            },
          });
        }
      } else {
        existingBuyer = await tx.user.findFirst({
          where: {
            id: parseInt(buyer),
          },
        });

        if (!existingBuyer) {
          throw new Error("Distributor not found!");
        }

        const buyerInput = await tx.buyer.findFirst({
          where: {
            name: existingBuyer.username,
            factory_id: parseInt(factory_id),
          },
        });

        if (!buyerInput) {
          const result = await tx.buyer.create({
            data: {
              name: existingBuyer.username,
              factory_id: parseInt(factory_id),
              address: existingBuyer.address,
            },
          });
          existingBuyer.id = result.id;
        } else {
          existingBuyer.id = buyerInput.id;
        }

        locations = await tx.location.findFirst({
          where: {
            name: existingBuyer.address,
            factory_id: parseInt(factory_id),
            cost: 0,
          },
        });

        if (!locations) {
          locations = await tx.location.create({
            data: {
              name: existingBuyer.address,
              factory_id: parseInt(factory_id),
              cost: 0,
            },
          });
        }
      }

      const status = await tx.deliveryTracking.findFirst({
        where: {
          invoice_id: existingInvoice.id,
        },
      });



      await tx.invoice.delete({
        where: {
          id: existingInvoice.id,
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          factory_id: parseInt(factory_id),
          user_id: parseInt(user_id),
          invoice_code: existingInvoice.invoice_code,
          discount,
          ppn,
          buyer_id: existingBuyer.id,
          maturity_date: new Date(maturity_date),
          item_amount,
          discon_member,
          down_payment,
          total,
          notes,
          is_distributor: is_distributor === "distributor" ? true : false,
          sub_total,
          remaining_balance,
          payment_status: payment_status as PaymentStatus,
          payment_method_id: parseInt(payment_method_id),
          detailInvoices: {
            createMany: {
              data: detailInvoices.map((detail: any) => ({
                product_id: detail.product_id
                  ? parseInt(detail.product_id)
                  : undefined,
                desc: detail.desc,
                amount: detail.amount,
                price: detail.price ? parseInt(detail.price) : undefined,
                discount: detail.discount
                  ? parseInt(detail.discount)
                  : undefined,
                sub_total: detail.sub_total
                  ? parseInt(detail.sub_total)
                  : undefined,
                is_product: detail.is_product,
              })),
            },
          },
        },
      });



      await tx.deliveryTracking.create({
        data: {
          invoice_id: invoice.id,
          desc: desc,
          location_id: locations!.id,
          cost: shipping_cost,
          status: status?.status,
        },
      });
    });

    return NextResponse.json(
      {
        message: "Invoice berhasil diupdate",
        data: response,
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

export async function DELETE(req: Request, { params }: { params: any }) {
  const paramId: any = await params;
  const id = paramId.id;

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
      { message: error.message || "Terjadi kesalahan saat menghapus invoice" },
      { status: 500 }
    );
  }
}
