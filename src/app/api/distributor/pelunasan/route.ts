/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { deleteFile, uploadFile } from "@/lib/imagekit";
import { NextResponse } from "next/server";

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

    if((invoice.payment_status != "Paid")) {
      return NextResponse.json({ message: "Untuk pelunasan, invoice harus sudah dibayar dan diterima oleh operator pabrik!" }, { status: 400 });
    }

    if(!proof_of_payment) {
      return NextResponse.json({ message: "Bukti pembayaran tidak ditemukan" }, { status: 400 });
    }

    const fileObject = {
      buffer: Buffer.from(await proof_of_payment.arrayBuffer()),
      originalname: proof_of_payment.name,
      mimetype: proof_of_payment.type,
    };

    const proof_payment_url = await uploadFile(fileObject);

    if(invoice.proof_of_payment_2) {
      await deleteFile(invoice.proof_of_payment_2);
    }

    // jika factory_idnya null maka update remaining_balance menjadi 0 dan payment_status menjadi Paid_Off
    const payload: any = {};
    if(!invoice.factory_id) {
      payload.remaining_balance = 0;
      payload.payment_status = "Paid_Off";
    }

    payload.proof_of_payment_2 = proof_payment_url;

    const result = await prisma.invoice.update({
      where: {
        id: Number(invoice_id),
      },
      data: {
        ...payload,
      },
    });

    return NextResponse.json({ message: "Bukti pembayaran berhasil diupload", result });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Gagal mengupload bukti pembayaran" }, { status: 500 });
  }
}
