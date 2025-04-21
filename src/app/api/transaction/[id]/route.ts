/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { deleteFile } from "@/lib/imagekit";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: any }) {
  try {
    const paramId = await params;
    const id = paramId.id;

    const invoice = await prisma.invoice.findUnique({
      where: { invoice_code: id },
      include: {
        payment_method: true,
        factory: true,
        deliveryTracking: {
          include: {
            location: true,
          }
        },
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
      notes,
      location_selected
    } = body;

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

      const existInvoice = await tx.invoice.findFirst({
        where: {
          id: parseInt(id),
        },
        include: {
          deliveryTracking: true,
        }
      })


      if(!existInvoice) {
        throw new Error("Invoice tidak ditemukan");
      }

      await tx.deliveryTracking.deleteMany({
        where: {
          invoice_id: existInvoice.id,
        }
      });

      await tx.detailInvoice.deleteMany({
        where: {
          invoice_id: existInvoice.id,
        }
      });

      await tx.invoice.delete({
        where: {
          id: existInvoice.id,
        }
      });

      const invoice = await tx.invoice.create({
        data: {
          invoice_code: existInvoice?.invoice_code,
          total: Number(total) + Number(down_payment),
          down_payment,
          is_distributor: is_distributor,
          type_preorder: type_preorder === "1" ? true : false,
          user_id: parseInt(user_id),
          factory_id: parseInt(factory_id),
          buyer_id: pembeli_id,
          ppn: 0,
          payment_method_id: parseInt(payment_method_id),
          sub_total,
          payment_status: existInvoice.payment_status,
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
      message: "Transaksi berhasil diperbarui",
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

export async function DELETE(req: Request, { params }: { params: any }) {
  const paramId: any = await params;
  const id = paramId.id;

  try {
    const existInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
    });

    if(existInvoice?.proof_of_payment) {
      await deleteFile(existInvoice?.proof_of_payment);
    }

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
