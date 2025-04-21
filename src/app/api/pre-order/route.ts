/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { uploadFile } from "@/lib/imagekit";
import { PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const factory_id = data.get("factory_id") || "";
    const user_id = data.get("user_id");
    const down_payment = data.get("down_payment");
    const total = data.get("total");
    const sub_total = data.get("sub_total");
    const remaining_balance = data.get("remaining_balance");
    const payment_status = data.get("payment_status");
    const payment_method_id = data.get("payment_method_id");
    const notes = data.get("notes");
    const bukti_pembayaran = data.get("proof_of_payment") as File;
    const detail_invoices = data.get("detail_invoices");

    // Validasi data wajib
    if (!user_id || !payment_method_id) {
      return NextResponse.json(
        { 
          status: "error",
          message: "Data tidak lengkap" 
        }, 
        { status: 400 }
      );
    }

    const whereFactory: any= {};
    if(factory_id) {
      whereFactory.factory_id = parseInt(factory_id.toString())
    } else {
      delete whereFactory.factory_id;
    }

    // Handle upload file jika ada
    let fileUrl = "";
    if (bukti_pembayaran) {
      try {
        const fileObject = {
          buffer: Buffer.from(await bukti_pembayaran.arrayBuffer()),
          originalname: bukti_pembayaran.name,
          mimetype: bukti_pembayaran.type,
        };
        fileUrl = await uploadFile(fileObject);
      } catch (error: any) {
        return NextResponse.json(
          {
            status: "error", 
            message: error.message || "Gagal mengupload file"
          },
          { status: 400 }
        );
      }
    }

    let buyer_id: any = null;
    let location_id: any = null;
    // Generate kode invoice
    const invoice_code = `INV-${new Date().getFullYear()}-${
      new Date().getMonth() + 1
    }-${Math.floor(100000 + Math.random() * 900000)}`;

    // Hitung total amount
    const detail_invoices_array = JSON.parse(detail_invoices as string);
    // Proses transaksi database
    const response = await prisma.$transaction(async (tx) => {

      // Check available user
      const existUser = await prisma.user.findFirst({
        where: {
          id: parseInt(user_id.toString())
        }
      });

      if(!existUser) {
        throw new Error("User tidak ditemukan!");
      }

      // check exist Buyer
      const existBuyer = await prisma.buyer.findFirst({
        where: {
          name: existUser.username,
          factory_id: whereFactory.factory_id,
          address: existUser.address
        }
      });

      if(!existBuyer) {
        const createBuyer = await prisma.buyer.create({
          data: {
            address: existUser.address,
            name: existUser.username,
            factory_id: whereFactory.factory_id
          }
        })
        buyer_id = createBuyer.id;
      } else {
        buyer_id = existBuyer.id;
      }

      const existAddress = await prisma.location.findFirst({
        where: {
          name: existUser.address,
          factory_id: whereFactory.factory_id
        }
      });

      if(!existAddress) {
        const createAddress = await prisma.location.create({
          data: {
            name: existUser.address,
            cost: 0,
            factory_id: whereFactory.factory_id
          }
        });
        location_id = createAddress.id;
      } else {
        location_id = existAddress.id;
      }
      // Check exist 


      // Buat invoice
      const preOrder = await tx.invoice.create({
        data: {
          factory_id: whereFactory.factory_id,
          user_id: Number(user_id),
          invoice_code,
          buyer_id: Number(buyer_id),
          item_amount: Number(detail_invoices_array.length),
          down_payment: Number(down_payment),
          total: Number(total),
          sub_total: Number(total),
          remaining_balance: Number(remaining_balance),
          payment_status: payment_status as PaymentStatus,
          payment_method_id: Number(payment_method_id),
          notes: notes as string,
          type_preorder: true,
          is_distributor: true,
          proof_of_payment: fileUrl == null ? undefined : fileUrl,
          detailInvoices: {
            createMany: {
              data: detail_invoices_array.map((detail: any) => ({
                product_id: detail.product_id,
                desc: detail.desc,
                amount: detail.jumlah,
                price: detail.harga,
                discount: detail.discount,
                sub_total: Number(detail.jumlah) * Number(detail.harga),
              })),
            },
          },
        },
      });

      // Buat tracking delivery
      await tx.deliveryTracking.create({
        data: {
          invoice_id: preOrder.id,
          location_id: location_id,
          cost: 0,
          status: "Process",
        },
      });

      return preOrder;
    });

    return NextResponse.json({
      status: "success",
      message: "Pre-order berhasil dibuat",
      data: response,
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 500 }
    );
  }
}


