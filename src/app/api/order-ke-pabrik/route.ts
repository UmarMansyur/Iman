/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { deleteFile, uploadFile } from "@/lib/imagekit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const transaction_distributor_id = formData.get("transaction_distributor_id") as string;
  const payment_method_id = formData.get("payment_method_id") as string;
  const desc_delivery = formData.get("desc_delivery") as string;
  const down_payment = formData.get("down_payment") as string;
  const user_id = formData.get("user_id") as string;

  if(!transaction_distributor_id) {
    return NextResponse.json({ message: "Kode transaksi distributor tidak ditemukan" }, { status: 400 });
  }

  if(!payment_method_id) {
    return NextResponse.json({ message: "Metode pembayaran tidak ditemukan" }, { status: 400 });
  }

  if(!desc_delivery) {
    return NextResponse.json({ message: "Deskripsi pengiriman tidak ditemukan" }, { status: 400 });
  }

  if(!down_payment) {
    return NextResponse.json({ message: "Jumlah pembayaran tidak ditemukan" }, { status: 400 });
  }

  if(!user_id) {
    return NextResponse.json({ message: "User tidak ditemukan" }, { status: 400 });
  }

  try {
    const transaction = await prisma.transactionDistributor.findUnique({
      where: { id: Number(transaction_distributor_id) },
      include: {
        DetailTransactionDistributor: true,
        factory: true,
      },
    });

    if(!transaction) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
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

    // sekarang tolong insertkan data ke table invoice dimana factory_id adalah transaction.factory_id

    // check dulu apakah buyer sudah ada atau belum
    let buyer = await prisma.buyer.findFirst({
      where: {
        name: user?.username,
        address: user?.address,
        factory_id: Number(transaction.factory_id),
      },
    });

    // jika tidak ada create dulu

    if(!buyer) {
      buyer = await prisma.buyer.create({
        data: {
          name: user?.username || "",
          address: user?.address || "",
          factory_id: Number(transaction.factory_id),
        },
      });
    }


    // check apakah lokasi sudah ada atau belum
    let location = await prisma.location.findFirst({
      where: {
        name: user?.address || "",
        cost: 0,
        factory_id: Number(transaction.factory_id),
      },
    });

    if(!location) {
      location = await prisma.location.create({
        data: {
          name: user?.address || "",
          cost: 0,
          factory_id: Number(transaction.factory_id),
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

    // cek apakah invoice sudah ada atau belum
    const existingInvoice  = await prisma.invoice.findFirst({
      where: {
        invoice_code: "INV-" + transaction.invoice_code + "-" + transaction.id,
      },
    });

    if(existingInvoice) {
      // jika sudah ada maka tampilkan pesan error
      return NextResponse.json({ message: "Invoice sudah ada" }, { status: 400 });
    }



    const invoice = await prisma.invoice.create({
      data: {
        factory_id: Number(transaction.factory_id),
        user_id: Number(user_id),
        invoice_code: "INV-" + transaction.invoice_code + "-" + transaction.id,
        discount: 0,
        ppn: 0,
        buyer_id: buyer.id,
        item_amount: transaction.DetailTransactionDistributor.length,
        discon_member: 0,
        down_payment: Number(down_payment),
        remaining_balance: transaction.DetailTransactionDistributor.reduce((acc: any, item: any) => {
          const productPrice = product.find((p: any) => p.id === item.product_id)?.price || 0;
          return acc + (item.amount * productPrice * 200);
        }, 0) - Number(down_payment),
        // total adalah jumlah dari transaction.DetailTransactionDistributor.amount * product.price * 200
        total: transaction.DetailTransactionDistributor.reduce((acc: any, item: any) => {
          const productPrice = product.find((p: any) => p.id === item.product_id)?.price || 0;
          return acc + (item.amount * productPrice * 200);
        }, 0),
        sub_total: transaction.DetailTransactionDistributor.reduce((acc: any, item: any) => {
          const productPrice = product.find((p: any) => p.id === item.product_id)?.price || 0;
          return acc + (item.amount * productPrice * 200);
        }, 0),
        payment_method_id: Number(payment_method_id),
        proof_of_payment: proof_payment_url,
        payment_status: "Unpaid",
        type_preorder: true,
        detailInvoices: {
          create: transaction.DetailTransactionDistributor.map((item: any) => ({
            product_id: item.product_id,
            amount: item.amount,
            price: (product.find((p: any) => p.id === item.product_id)?.price || 0) * 200,
            desc: product.find((p: any) => p.id === item.product_id)?.name + " - " + product.find((p: any) => p.id === item.product_id)?.type,
            discount: 0,
            sub_total: (product.find((p: any) => p.id === item.product_id)?.price || 0) * 200 * item.amount,
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


    return NextResponse.json({ message: "Invoice created successfully", invoice });
  } catch (error: any) {
    console.log(error);
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

    const result = await prisma.invoice.update({
      where: {
        id: Number(invoice_id),
      },
      data: {
        proof_of_payment: proof_payment_url,
        payment_status: "Pending",
      },
    });

    return NextResponse.json({ message: "Bukti pembayaran berhasil diupload", result });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Gagal mengupload bukti pembayaran" }, { status: 500 });
  }
}
