/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { formatDateIndonesia } from "@/lib/utils";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PaymentStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const user_id = searchParams.get("user_id") || "";
    const filterStatus = searchParams.get("filterStatus") || "";
    const filterPayment = searchParams.get("filterPayment") || "";
    const type_preorder = searchParams.get("type_preorder") || "";

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

    if(type_preorder === "true" || type_preorder === "1") {
      where.type_preorder = true;
    } else if(type_preorder === "false" || type_preorder === "0") {
      where.type_preorder = false;
    } else {
      delete where.type_preorder;
    }

    if (filterPayment === "") {
      delete where.payment_method_id;
    } else if (filterPayment == "all") {
      delete where.payment_method_id;
    } else {
      where.payment_method_id = Number(filterPayment);
    }
    if (filterStatus === "") {
      delete where.payment_status;
    } else if (filterStatus === "all") {
      where.payment_status = {
        in: [
          PaymentStatus.Pending,
          PaymentStatus.Paid,
          PaymentStatus.Paid_Off,
          PaymentStatus.Failed,
          PaymentStatus.Cancelled,
          PaymentStatus.Unpaid,
        ],
      };
    } else if (filterStatus === "Pending") {
      where.payment_status = PaymentStatus.Pending;
    } else if (filterStatus === "Paid") {
      where.payment_status = PaymentStatus.Paid;
    } else if (filterStatus === "Paid_Off") {
      where.payment_status = PaymentStatus.Paid_Off;
    } else if (filterStatus === "Failed") {
      where.payment_status = PaymentStatus.Failed;
    } else if (filterStatus === "Cancelled") {
      where.payment_status = PaymentStatus.Cancelled;
    } else if (filterStatus === "Unpaid") {
      where.payment_status = PaymentStatus.Unpaid;
    }


    const memberDistributor = await prisma.factoryDistributor.findFirst({
      where: {
        MemberDistributor: {
          some: {
            user_id: parseInt(user_id),
          },
        },
      },
      include: {
        Factory: true,
      },
    });

    if(!memberDistributor) {
      throw new Error("Member distributor tidak ditemukan");
    }

    const factoryName = memberDistributor?.name || "";

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