/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { formatDateIndonesia, formatProduction } from "@/lib/utils";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import moment from "moment";
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

    // Build where clause
    const where: Record<string, any> = {};

    // jika tidak ada tanggal maka throw error
    if (startDate == "" && endDate == "") {
      throw new Error("Tanggal tidak boleh kosong");
    }

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
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Produksi - " + factoryName + " - " + new Date().getFullYear());

    // Set kolom width
    worksheet.columns = [
      { width: 15 }, // Tanggal
      { width: 20 }, // Nama Produk
      { width: 20 }, // Operator Pagi
      { width: 15 }, // Pack Pagi
      { width: 15 }, // Bal Pagi
      { width: 20 }, // Operator Sore
      { width: 15 }, // Pack Sore
      { width: 15 }, // Bal Sore
    ];

    // Add title
    worksheet.mergeCells("A1:H1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Laporan Produksi - ${factoryName} dari ${moment(startDate).format("DD MMMM YYYY")} sampai ${moment(endDate).format("DD MMMM YYYY")}`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Add empty row
    worksheet.addRow([]);

    // Add headers
    const mainHeader = worksheet.addRow([
      "Tanggal",
      "Nama Produk",
      "Nama Operator Pagi",
      "Jumlah Produksi",
      "Jumlah Produksi",
      "Nama Operator Sore",
      "Jumlah Produksi",
      "Jumlah Produksi",
    ]);

    const subHeader = worksheet.addRow([
      "",
      "",
      "",
      "Pack (Pagi)",
      "Bal (Pagi)",
      "",
      "Pack (Sore)",
      "Bal (Sore)",
    ]);

    // Style headers
    [mainHeader, subHeader].forEach((row) => {
      row.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Merge cells
    worksheet.mergeCells("A3:A4"); // Tanggal
    worksheet.mergeCells("B3:B4"); // Nama Produk
    worksheet.mergeCells("C3:C4"); // Operator Pagi
    worksheet.mergeCells("D3:E3"); // Jumlah Produksi Pagi
    worksheet.mergeCells("F3:F4"); // Operator Sore
    worksheet.mergeCells("G3:H3"); // Jumlah Produksi Sore

    // Add data
    data.forEach((item) => {
      const morningProduction = formatProduction(
        Number(item.morning_shift_amount || 0)
      );
      const afternoonProduction = formatProduction(
        Number(item.afternoon_shift_amount || 0)
      );

      const row = worksheet.addRow([
        formatDateIndonesia(item.created_at),
        item.product.name + " - " + item.product.type,
        item.morning_shift_user?.username || "",
        new Intl.NumberFormat("id-ID").format(morningProduction.pack),
        new Intl.NumberFormat("id-ID").format(morningProduction.bal),
        item.afternoon_shift_user?.username || "",
        new Intl.NumberFormat("id-ID").format(afternoonProduction.pack),
        new Intl.NumberFormat("id-ID").format(afternoonProduction.bal),
      ]);

      // Style data rows
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

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan-produksi.xlsx"',
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
