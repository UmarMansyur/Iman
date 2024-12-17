/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { DeliveryTrackingStatus, PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      detail_invoices,
      total,
      down_payment,
      location_price,
      is_distributor,
      type_preorder,
      new_pembeli,
      buyer_name,
      buyer_address,
      distributor_id,
      factory_id,
      user_id,
      buyer_id,
      new_address,
      payment_method_id,
      sub_total,
      payment_status,
      notes,
      location_selected
    } = body;

    // inv tahun-bulan-id
    const invoice_code =
      "INV-" +
      new Date().getFullYear() +
      "-" +
      (new Date().getMonth() + 1) +
      "-" +
      Math.floor(100000 + Math.random() * 900000).toString();

    let location_id: any= null;
    let pembeli_id: any = null;
    const response = await prisma.$transaction(async (tx) => {
      if(new_address) {
        const existAddress = await tx.location.findFirst({
          where: {
            name: buyer_address,
            factory_id: parseInt(factory_id),
          }
        })
        if(existAddress) {
          throw new Error("Alamat sudah ada");
        }

        const address = await tx.location.create({
          data: {
            name: buyer_address,
            factory_id: parseInt(factory_id),
            cost: location_price,
          }
        });
        location_id = address.id;
      } else {
        const location = await tx.location.findFirst({
          where: {
            id: parseInt(location_selected),
          }
        });
        if(!location) {
          throw new Error("Alamat tidak ditemukan");
        }
        location_id = location.id;
      }
      if(new_pembeli) {
        const buyer = await tx.buyer.create({
          data: {
            name: buyer_name,
            address: buyer_address,
            factory_id: parseInt(factory_id), 
          }
        });
        pembeli_id = buyer.id;
      } else{
        pembeli_id = buyer_id;
      }

      if(is_distributor) {
        const user = await tx.user.findFirst({
          where: {
            id: parseInt(distributor_id),
          }
        });

        if(!user) {
          throw new Error("User tidak ditemukan");
        }

        const existBuyer = await tx.buyer.findFirst({
          where: {
            name: user.username,
            factory_id: parseInt(factory_id),
          }
        });

        if(!existBuyer) {
          const buyer = await tx.buyer.create({
            data: {
              name: user.username,
              address: user.address,
              factory_id: parseInt(factory_id),
            }
          });
          pembeli_id = buyer.id;
        } else {
          pembeli_id = existBuyer.id;
        }
      }

      const invoice = await tx.invoice.create({
        data: {
          invoice_code,
          total: Number(total) + Number(down_payment),
          down_payment,
          is_distributor: is_distributor,
          type_preorder: type_preorder,
          user_id: parseInt(user_id),
          factory_id: parseInt(factory_id),
          buyer_id: pembeli_id,
          ppn: 0,
          payment_method_id: parseInt(payment_method_id),
          sub_total,
          payment_status: payment_status as PaymentStatus,
          notes,
          remaining_balance: Number(total),
          detailInvoices: {
            createMany: {
              data: detail_invoices.map((item: any) => ({
                product_id: item.product_id,
                amount: item.jumlah,
                desc: item.desc,
                discount: item.diskon,
                price: item.harga,
                sub_total: item.total_harga,
              })),
            },
          },
          item_amount: detail_invoices.length,
          discon_member: 0,
          discount: 0,
        },
      });

      await tx.deliveryTracking.create({
        data: {
          invoice_id: invoice.id,
          cost: location_price,
          status: "Process",
          location_id: location_id,
          desc: "Menunggu Konfirmasi"
        }
      });

      return invoice;
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
