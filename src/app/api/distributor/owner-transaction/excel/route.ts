/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { formatDateIndonesia } from "@/lib/utils";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { PaymentStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const user_id = searchParams.get("user_id") || "";
    const type_preorder = searchParams.get("type_preorder") || "";
    const filterPayment = searchParams.get("filterPayment") || "";
    const filterStatus = searchParams.get("filterStatus") || "";

    if(startDate == "" && endDate == ""){
      throw new Error("Tanggal tidak boleh kosong");
    }

    const where: any = {};

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
    });

    if(!memberDistributor) {
      throw new Error("Member distributor tidak ditemukan");
    }

    const members = await prisma.memberDistributor.findMany({
      where: {
        factory_distributor_id: memberDistributor.id,
      },
    });

    const userIds = members.map((member) => member.user_id);

    if(startDate && endDate) {
      where.created_at = {
        gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      }
    }

    if(userIds.length > 0) {
      where.user_id = {
        in: userIds,
      };
    }

    const factoryName = memberDistributor?.name || "";

    console.log(where);

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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Transaksi - " + factoryName);


    worksheet.columns = [
      { width: 20 }, // Tanggal
      { width: 20 }, // Kode Invoice
      { width: 25 }, // Pembeli
      { width: 20 }, // Metode Pembayaran
      { width: 20 }, // Status Pembayaran
      { width: 25 }, // Total
      { width: 20 }, // Status Pengiriman
    ];

    // Add title
    worksheet.mergeCells("A1:G1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Laporan Transaksi - ${factoryName}`;
    // add 
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.addRow([]);

    const headers = worksheet.addRow([
      "Tanggal",
      "Kode Invoice",
      "Pembeli",
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

    data.forEach((item) => {
      const row = worksheet.addRow([
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
        "Content-Disposition": 'attachment; filename="laporan-transaksi.xlsx"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}