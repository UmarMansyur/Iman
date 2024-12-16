/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { DeliveryTrackingStatus, PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      factory_id,
      notes,
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
      total,
      remaining_balance,
      payment_status,
      detailInvoices,
      desc,
      shipping_cost,
      shipping_address,
      is_distributor,
      buyer_address
    } = body;

    // inv tahun-bulan-id
    const invoice_code =
      "INV-" +
      new Date().getFullYear() +
      "-" +
      (new Date().getMonth() + 1) +
      "-" +
      Math.floor(100000 + Math.random() * 900000).toString();


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
              address: buyer_address
            },
          });
        }
        locations = await tx.location.findFirst({
          where: {
            name: shipping_address,
            factory_id: parseInt(factory_id)
          }
        });
        if(!locations) {
          locations = await tx.location.create({
            data: {
              name: shipping_address,
              factory_id: parseInt(factory_id),
              cost: shipping_cost
            }
          })
        }
      } else {
        existingBuyer = await tx.user.findFirst({
          where: {
            id: parseInt(buyer)
          }
        })

        if(!existingBuyer) {
          throw new Error("Distributor not found!");
        }

        const buyerInput = await tx.buyer.findFirst({
          where: {
            name: existingBuyer.username,
            factory_id: parseInt(factory_id)
          }
        })

        if(!buyerInput) {
          const result = await tx.buyer.create({
            data: {
              name: existingBuyer.username,
              factory_id: parseInt(factory_id),
              address: existingBuyer.address
            }
          })
          existingBuyer.id = result.id;
        } else {
          existingBuyer.id = buyerInput.id;
        }

        locations = await tx.location.findFirst({
          where: {
            name: existingBuyer.address,
            factory_id: parseInt(factory_id),
            cost: 0
          }
        });

        if(!locations) {
          locations = await tx.location.create({
            data: {
              name: existingBuyer.address,
              factory_id: parseInt(factory_id),
              cost: 0
            }
          })
        }
      }

      // console.log(locations);

      const invoice = await tx.invoice.create({
        data: {
          factory_id: parseInt(factory_id),
          user_id: parseInt(user_id),
          invoice_code,
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
        },
      });
    });

    return NextResponse.json({
      status: "success",
      message: "Transaksi berhasil dibuat",
      data: response,
    });
  } catch (error: any) {
    // console.log(error);
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
    const user_id = searchParams.get("user_id") || "";
    const skip = (page - 1) * limit;
    const factory_id = searchParams.get("factory_id") || "";
    const type_preorder = searchParams.get("type_preorder") || "";
    const status_delivery = searchParams.get("status_delivery") || "" as DeliveryTrackingStatus
    const where: any = {
      OR: [
        { buyer: { name: { contains: search } } },
        { invoice_code: { contains: search } }
      ],
      user_id: user_id ? parseInt(user_id) : undefined,
      type_preorder: type_preorder === "1" ? true : false,
    };

    if(status_delivery) {
      where.deliveryTracking = {
        status: status_delivery
      }
    }

    if(factory_id) {
      where.factory_id = parseInt(factory_id);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        factory: true,
        user: true,
        detailInvoices: {
          include: {
            product: true,
          },
        },
        buyer: true,
        payment_method: true,
        deliveryTracking: {
          include: {
            location: true
          }
        }
      },
      take: limit,
      skip: skip,
      orderBy: {
        created_at: "desc",
      },
    });

    const total = await prisma.invoice.count({
      where,
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
