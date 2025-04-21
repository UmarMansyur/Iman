/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { formatDateIndonesia, formatProduction } from "@/lib/utils";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import "jspdf-autotable";
// GET Request - Fetch Reports
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const factoryId = searchParams.get("factoryId");
    const filterProduct = searchParams.get("filterProduct") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    if(startDate == "" && endDate == ""){
      throw new Error("Tanggal tidak boleh kosong");
    }

    // Build where clause
    const where: Record<string, any> = {};
    if (search) {
      where.OR = [
        { product: { name: { contains: search } } },
        { User: { username: { contains: search } } },
      ];
    }
    if (factoryId) {
      where.factory_id = parseInt(factoryId, 10);
    }

    if (filterProduct === "all") {
      where.product_id = {
        not: null,
      };
    } else if (filterProduct) {
      where.product_id = parseInt(filterProduct, 10);
    }

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    const factory = await prisma.factory.findUnique({
      where: {
        id: Number(factoryId),
      },
    });

    const factoryName = factory?.name || "";


    const data = await prisma.reportProduct.findMany({
      where,
      include: {
        product: true,
        User: true,
        factory: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
        morning_shift_user: {
          select: {
            id: true,
            username: true,
          },
        },
        afternoon_shift_user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Buat dokumen PDF landscape
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Atur font dan ukuran
    doc.setFont("helvetica");

    // Header dengan logo perusahaan (opsional)
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Laporan Produksi`, doc.internal.pageSize.width / 2, 20, {
      align: "center",
    });

    // Sub header
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`${factoryName}`, doc.internal.pageSize.width / 2, 30, {
      align: "center",
    });

    // Tambahkan tanggal laporan
    doc.setFontSize(10);
    if (startDate && endDate) {
      doc.text(
        `Periode: ${formatDateIndonesia(
          new Date(startDate)
        )} - ${formatDateIndonesia(new Date(endDate))}`,
        doc.internal.pageSize.width / 2,
        40,
        { align: "center" }
      );
    }

    // Format data untuk tabel
    const tableData = data.map((item) => {
      const morningProduction = formatProduction(
        Number(item.morning_shift_amount || 0)
      );
      const afternoonProduction = formatProduction(
        Number(item.afternoon_shift_amount || 0)
      );

      return [
        formatDateIndonesia(item.created_at),
        item.product.name,
        item.morning_shift_user?.username || "-",
        new Intl.NumberFormat("id-ID").format(morningProduction.pack),
        new Intl.NumberFormat("id-ID").format(morningProduction.bal),
        item.afternoon_shift_user?.username || "-",
        new Intl.NumberFormat("id-ID").format(afternoonProduction.pack),
        new Intl.NumberFormat("id-ID").format(afternoonProduction.bal),
      ];
    });

    // Buat tabel menggunakan autoTable dengan styling yang lebih baik
    (doc as any).autoTable({
      startY: 45,
      head: [
        [
          { content: "Tanggal", rowSpan: 2 },
          { content: "Nama Produk", rowSpan: 2 },
          { content: "Operator Pagi", rowSpan: 2 },
          { content: "Jumlah Produksi Pagi", colSpan: 2 },
          { content: "Operator Sore", rowSpan: 2 },
          { content: "Jumlah Produksi Sore", colSpan: 2 },
        ],
        ["Pack", "Bal", "Pack", "Bal"],
      ],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 128, 185], // Warna biru untuk header
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 30, halign: "center" },
        1: { cellWidth: 40, halign: "left" },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 30, halign: "center" },
        6: { cellWidth: 25, halign: "right" },
        7: { cellWidth: 25, halign: "right" },
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Warna abu-abu muda untuk baris alternatif
      },
      margin: { top: 45 },
      didDrawPage: function (data: any) {
        // Footer
        doc.setFontSize(8);
        doc.text(
          `Dicetak pada: ${formatDateIndonesia(new Date())}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );

        // Nomor halaman
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
        "Content-Disposition": 'attachment; filename="laporan-produksi.pdf"',
      },
    });
  } catch (error: any) {
    console.error("Error fetching reports:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
