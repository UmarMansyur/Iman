/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { deleteFile, uploadFile } from "@/lib/imagekit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const payload = JSON.parse(formData.get("payload") as string);

  const invoice_list: any[] = [];

  // [{"payment_proof":"","transaction_distributor_id":"1","down_payment":"123123","payment_method_id":4,"desc_delivery":"","user_id":"4","factory_id":"1"},{"payment_proof":"","transaction_distributor_id":"1","down_payment":"213123123","payment_method_id":3,"desc_delivery":"","user_id":"4","factory_id":"other"}]

  try {
    await Promise.all(payload.map(async (item: any) => {
      const transaction_distributor_id = item.transaction_distributor_id;
      const payment_method_id = item.payment_method_id;
      const desc_delivery = item.desc_delivery;
      const down_payment = item.down_payment;
      const user_id = item.user_id;
  
      const whereFactory = item.factory_id == "other" ? null : Number(item.factory_id);
      const transaction = await prisma.transactionDistributor.findUnique({
        where: {
          id: Number(transaction_distributor_id),
          DetailTransactionDistributor: {
            some: {
              Product: {
                factory_id: {
                  equals: whereFactory,
                },
              },
            },
          },
        },
        include: {
          DetailTransactionDistributor: {
            include: {
              Product: true,
            },
          },
          Factory: true,
        },  
      });
  
      if(!transaction) {
        throw new Error("Transaction not found");
      }
  
      // ambil data product berdasarkan id di transaction.DetailTransactionDistributor
      const product = await prisma.product.findMany({
        where: {
          id: {
            in: transaction.DetailTransactionDistributor.map((item: any) => item.product_id),
          },
        },
      });
  
      if(!product) {
        throw new Error("Terdapat beberapa produk yang tidak ditemukan. Silahkan hubungi operator pabrik untuk informasi lebih lanjut.");
      }
  
      // ambil data user berdasarkan id
      const user = await prisma.user.findUnique({
        where: {
          id: Number(user_id),
        },
      });
  
      if(!user) {
        throw new Error("User tidak ditemukan. Silahkan hubungi operator pabrik untuk informasi lebih lanjut.");
      }
  
      // check apakah buyer sudah ada atau belum
      let buyer = await prisma.buyer.findFirst({
        where: {
          name: user?.username,
          address: user?.address,
        },
      });
  
      if(!buyer) {
        buyer = await prisma.buyer.create({
          data: {
            name: user?.username || "",
            address: user?.address || "",
          },
        });
      }
  
      let location = await prisma.location.findFirst({
        where: {
          name: user?.address || "",
          cost: 0,
        },
      });
  
      if(!location) {
        location = await prisma.location.create({
          data: {
            name: user?.address || "",
            cost: 0,
          },
        });
      }
  
      const proof_payment_file = formData.get("payment_proof") as File;
      let proof_payment_url = null;
      if(proof_payment_file) {
        const fileObject = {
          buffer: Buffer.from(await proof_payment_file.arrayBuffer()),
          originalname: proof_payment_file.name,
          mimetype: proof_payment_file.type,
        };
        proof_payment_url = await uploadFile(fileObject);
      }

      // jika factory_id other maka ganti angka menjadi 3
      const factory_id = item.factory_id == "other" ? "3A" : Number(item.factory_id);
      const existingInvoice  = await prisma.invoice.findFirst({
        where: {
          invoice_code: "INV-" + transaction.invoice_code + "-" + transaction.id + "-" + factory_id,
        },
      });
  
      if(existingInvoice) {
        throw new Error("Invoice sudah ada");
      }
  
  
      const invoice = await prisma.invoice.create({
        data: {
          // jika other maka null
          factory_id: item.factory_id == "other" ? null : Number(item.factory_id),
          user_id: Number(user_id),
          invoice_code: "INV-" + transaction.invoice_code + "-" + transaction.id + "-" + factory_id,
          discount: 0,
          ppn: 0,
          buyer_id: buyer.id,
          item_amount: transaction.DetailTransactionDistributor.length,
          discon_member: 0,
          down_payment: Number(down_payment),
          remaining_balance: transaction.DetailTransactionDistributor
            .filter((item: any) => item.Product.factory_id == whereFactory)
            .reduce((acc: any, item: any) => {
              const productPrice = product.find((p: any) => p.id === item.product_id)?.price || 0;
              return acc + (item.amount * productPrice);
            }, 0) - Number(down_payment),
          total: transaction.DetailTransactionDistributor
            .filter((item: any) => item.Product.factory_id == whereFactory)
            .reduce((acc: any, item: any) => {
              const productPrice = product.find((p: any) => p.id === item.product_id)?.price || 0;
              return acc + (item.amount * productPrice);
            }, 0),
          sub_total: transaction.DetailTransactionDistributor
            .filter((item: any) => item.Product.factory_id == whereFactory)
            .reduce((acc: any, item: any) => {
              const productPrice = product.find((p: any) => p.id === item.product_id)?.price || 0;
              return acc + (item.amount * productPrice);
            }, 0),
          payment_method_id: Number(payment_method_id),
          proof_of_payment: proof_payment_url,
          payment_status: "Unpaid",
          type_preorder: true,
          detailInvoices: {
            create: transaction.DetailTransactionDistributor
            .filter((item: any) => item.Product.factory_id == whereFactory)
            .map((item: any) => ({
              product_id: item.product_id,
              amount: item.amount,
              price: (product.find((p: any) => p.id === item.product_id)?.price || 0),
              desc: product.find((p: any) => p.id === item.product_id)?.name + " - " + product.find((p: any) => p.id === item.product_id)?.type,
              discount: 0,
              sub_total: (product.find((p: any) => p.id === item.product_id)?.price || 0) * item.amount,
            })),
          },
          notes: desc_delivery,
          deliveryTracking: {
            create: {
              cost: 0,
              sales_man: "",
              recipient: "",
              location_id: location.id,
            }
          }
        },
      });
  
  
      invoice_list.push(invoice);
    }));

    return NextResponse.json({ message: "Invoice created successfully", invoice_list });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create invoice", error: error }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const formData = await req.formData();
  const invoice_id = formData.get("invoice_id") as string;
  const proof_of_payment = formData.get("proof_of_payment") as File;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: Number(invoice_id),
      },
    });

    if(!invoice) {
      return NextResponse.json({ message: "Invoice tidak ditemukan" }, { status: 404 });
    }

    if((invoice.payment_status != "Unpaid" && invoice.payment_status != "Pending")) {
      return NextResponse.json({ message: "Invoice sudah diterima oleh operator pabrik dan tidak bisa diubah" }, { status: 400 });
    }

    // 

    if(!proof_of_payment) {
      return NextResponse.json({ message: "Bukti pembayaran tidak ditemukan" }, { status: 400 });
    }

    const fileObject = {
      buffer: Buffer.from(await proof_of_payment.arrayBuffer()),
      originalname: proof_of_payment.name,
      mimetype: proof_of_payment.type,
    };

    const proof_payment_url = await uploadFile(fileObject);

    // jika proof_payment_url sudah ada maka hapus file lama
    if(invoice.proof_of_payment) {
      await deleteFile(invoice.proof_of_payment);
    }

    const payment_status = invoice.factory_id === null ? "Paid" : "Pending";

    const result = await prisma.invoice.update({
      where: {
        id: Number(invoice_id),
      },
      data: {
        proof_of_payment: proof_payment_url,
        payment_status: payment_status,
      },
    });

    if(invoice.factory_id === null) {
      await prisma.deliveryTracking.updateMany({
        where: {
          invoice_id: Number(invoice_id),
        },
        data: {
          status: "Done",
        },
      });
    }

    return NextResponse.json({ message: "Bukti pembayaran berhasil diupload", result });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Gagal mengupload bukti pembayaran" }, { status: 500 });
  }
}
