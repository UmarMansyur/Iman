/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { formatDateIndonesia } from "@/lib/utils";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const factory_id = searchParams.get("factory_id") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

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

    if(factory_id) {
      where.factory_id = parseInt(factory_id);
    }

    const factory = await prisma.factory.findUnique({
      where: {
        id: Number(factory_id),
      },
    });

    const factoryName = factory?.name || "";

    const data = await prisma.transactionService.findMany({
      where,
      include: {
        buyer: true,
        DetailTransactionService: {
          include: {
            service: true,
          },
        },
        payment_method: true,
        user: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Transaksi Jasa - " + factoryName);

    worksheet.columns = [
      { width: 20 }, // Tanggal
      { width: 20 }, // Kode Transaksi
      { width: 25 }, // Pembeli
      { width: 20 }, // Metode Pembayaran
      { width: 20 }, // Status
      { width: 20 }, // DP
      { width: 25 }, // Total
      { width: 20 }, // Sisa
    ];

    // Add title
    worksheet.mergeCells("A1:H1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Laporan Transaksi Jasa - ${factoryName}`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.addRow([]);

    const headers = worksheet.addRow([
      "Tanggal",
      "Kode Transaksi",
      "Pembeli",
      "Metode Pembayaran",
      "Status",
      "DP",
      "Total",
      "Sisa",
    ]);

    headers.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    data.forEach((item) => {
      const row = worksheet.addRow([
        formatDateIndonesia(item.created_at),
        item.transaction_code,
        item.buyer?.name || "-",
        item.payment_method.name,
        item.status,
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(Number(item.down_payment)),
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(Number(item.amount)),
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(Number(item.remaining_balance)),
      ]);

      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan-transaksi-jasa.xlsx"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}