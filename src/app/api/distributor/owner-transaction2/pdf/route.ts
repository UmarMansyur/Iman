/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { formatDateIndonesia } from "@/lib/utils";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import "jspdf-autotable";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const distributor_id = searchParams.get("distributor_id") || "";
    const filterStatus = searchParams.get("filterStatus") || "";
    const filterPayment = searchParams.get("filterPayment") || "";

    if (startDate == "" && endDate == "") {
      throw new Error("Tanggal tidak boleh kosong");
    }

    const where: any = {};

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    if (filterStatus == "all" || filterStatus == "") {
      delete where.status_payment;
    } else {
      where.status_payment = filterStatus;
    }

    if (filterPayment == "all" || filterPayment == "") {
      delete where.payment_method_id;
    } else {
      where.payment_method_id = Number(filterPayment);
    }

    const FactoryDistributor = await prisma.factoryDistributor.findFirst({
      where: {
        MemberDistributor: {
          some: {
            user_id: parseInt(distributor_id),
          },
        },
      },
    });

    if (!FactoryDistributor) {
      throw new Error("Distributor tidak ditemukan");
    }

    const members = await prisma.memberDistributor.findMany({
      where: {
        factory_distributor_id: FactoryDistributor.id,
      },
    });

    const member_ids = members.map((member) => member.user_id);

    if (distributor_id) {
      where.distributor_id = {
        in: member_ids,
      };
    }

    console.log(where);

    const transactions = await prisma.transactionDistributor.findMany({
      where,
      include: {
        buyer: true,
        payment_method: true,
        DetailTransactionDistributor: {
          include: {
            Product: true,
          },
        },
        distributor: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Buat dokumen PDF landscape
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Laporan Transaksi Distributor - ${FactoryDistributor.name}`, doc.internal.pageSize.width / 2, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    if (startDate && endDate) {
      doc.text(
        `Periode: ${formatDateIndonesia(new Date(startDate))} - ${formatDateIndonesia(new Date(endDate))}`,
        doc.internal.pageSize.width / 2,
        30,
        { align: "center" }
      );
    }

    const tableData = transactions.map((item) => [
      formatDateIndonesia(item.created_at),
      item.invoice_code,
      item.buyer?.name || "-",
      item.distributor.username,
      item.payment_method.name,
      item.status_payment,
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(Number(item.amount)),
      item.status_delivery,
    ]);

    (doc as any).autoTable({
      startY: 35,
      head: [
        [
          "Tanggal",
          "Kode Invoice",
          "Pembeli",
          "Distributor",
          "Metode Pembayaran",
          "Status Pembayaran",
          "Total",
          "Status Pengiriman",
        ],
      ],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 },
        5: { cellWidth: 35 },
        6: { cellWidth: 35 },
        7: { cellWidth: 35 },
      },
      margin: { top: 35 },
      didDrawPage: function (data: any) {
        doc.setFontSize(8);
        doc.text(
          `Dicetak pada: ${formatDateIndonesia(new Date())}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );

        doc.text(
          `Halaman ${data.pageNumber} dari ${data.pageCount}`,
          doc.internal.pageSize.width - data.settings.margin.right,
          doc.internal.pageSize.height - 10,
          { align: "right" }
        );
      },
    });

    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="laporan-transaksi-distributor.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}