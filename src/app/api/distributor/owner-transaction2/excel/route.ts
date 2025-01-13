/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { formatDateIndonesia } from "@/lib/utils";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Transaksi Distributor - " + FactoryDistributor.name);

    worksheet.columns = [
      { width: 20 }, // Tanggal
      { width: 20 }, // Kode Invoice
      { width: 25 }, // Pembeli
      { width: 20 }, // Distributor
      { width: 20 }, // Metode Pembayaran
      { width: 20 }, // Status Pembayaran
      { width: 25 }, // Total
      { width: 20 }, // Status Pengiriman
    ];

    // Add title
    worksheet.mergeCells("A1:H1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Laporan Transaksi Distributor - ${FactoryDistributor.name}`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Add period
    if (startDate && endDate) {
      worksheet.mergeCells("A2:H2");
      const periodCell = worksheet.getCell("A2");
      periodCell.value = `Periode: ${formatDateIndonesia(new Date(startDate))} - ${formatDateIndonesia(
        new Date(endDate)
      )}`;
      periodCell.font = { size: 10 };
      periodCell.alignment = { vertical: "middle", horizontal: "center" };
    }

    worksheet.addRow([]);

    const headers = worksheet.addRow([
      "Tanggal",
      "Kode Invoice",
      "Pembeli",
      "Distributor",
      "Metode Pembayaran",
      "Status Pembayaran",
      "Total",
      "Status Pengiriman",
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

    transactions.forEach((item) => {
      const row = worksheet.addRow([
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
        "Content-Disposition": 'attachment; filename="laporan-transaksi-distributor.xlsx"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}