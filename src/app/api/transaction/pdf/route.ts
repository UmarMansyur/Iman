/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { formatDateIndonesia } from "@/lib/utils";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import "jspdf-autotable";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const factory_id = searchParams.get("factory_id") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const filterPayment = searchParams.get("filterPayment") || "";
    const filterStatus = searchParams.get("filterStatus") || "";

    if(startDate == "" && endDate == ""){
      throw new Error("Tanggal tidak boleh kosong");
    }

    const where: any = {};

    if(startDate && endDate) {
      where.created_at = {
        gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      }
    }

    if(filterPayment == 'all' || filterPayment == "") {
      delete where.payment_method_id;
    } else {
      where.payment_method_id = Number(filterPayment);
    }

    if(filterStatus == 'all' || filterStatus == "") {
      delete where.payment_status;
    } else {
      where.payment_status = filterStatus;
    }

    if(factory_id) {
      where.factory_id = parseInt(factory_id);
    }

    const factory = await prisma.factory.findUnique({
      where: {
        id: Number(factory_id),
      },
    });

    const factoryName = factory?.name || "";

    const data = await prisma.invoice.findMany({
      where,
      include: {
        buyer: true,
        detailInvoices: {
          include: {
            product: true,
          },
        },
        payment_method: true,
        deliveryTracking: true,
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
    doc.text(`Laporan Transaksi - ${factoryName}`, doc.internal.pageSize.width / 2, 20, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`${factoryName}`, doc.internal.pageSize.width / 2, 30, {
      align: "center",
    });

    doc.setFontSize(10);
    if (startDate && endDate) {
      doc.text(
        `Periode: ${formatDateIndonesia(new Date(startDate))} - ${formatDateIndonesia(new Date(endDate))}`,
        doc.internal.pageSize.width / 2,
        40,
        { align: "center" }
      );
    }

    const tableData = data.map((item) => [
      formatDateIndonesia(item.created_at),
      item.invoice_code,
      item.buyer?.name || "-",
      item.payment_method.name,
      item.payment_status,
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(Number(item.total)),
      item.deliveryTracking[0]?.status || "-",
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [
        [
          "Tanggal",
          "Kode Invoice",
          "Pembeli",
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
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
        5: { cellWidth: 40 },
        6: { cellWidth: 35 },
      },
      margin: { top: 45 },
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
        "Content-Disposition": 'attachment; filename="laporan-transaksi.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}