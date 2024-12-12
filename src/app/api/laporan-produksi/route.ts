/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// GET Request - Fetch Reports
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const factoryId = searchParams.get("factoryId");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, any> = {};
    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: "insensitive" } } },
        { user: { username: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (factoryId) {
      where.factory_id = parseInt(factoryId, 10);
    }

    const [data, total] = await Promise.all([
      prisma.reportProduct.findMany({
        where,
        include: {
          product: true,
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
        skip,
        take: limit,
      }),
      prisma.reportProduct.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
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

// POST Request - Create ReportProduct
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      product_id,
      factory_id,
      morning_shift_amount,
      morning_shift_time,
      afternoon_shift_amount,
      afternoon_shift_time,
      morning_shift_user_id,
      afternoon_shift_user_id,
    } = body;

    // Validate required fields
    if (!product_id || !factory_id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // amount adalah jumlah produk dari morning_shift_amount dan afternoon_shift_amount
    const amount = morning_shift_amount
      ? parseFloat(morning_shift_amount)
      : 0 + afternoon_shift_amount
      ? parseFloat(afternoon_shift_amount)
      : 0;

    // cegah jika hari ini telah ada laporan produksi
    const existReport = await prisma.reportProduct.findFirst({
      where: {
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        product_id: parseInt(product_id, 10),
        factory_id: parseInt(factory_id, 10),
      },
    });

    if (existReport) {
      return NextResponse.json(
        { message: "Hari ini sudah ada laporan produksi" },
        { status: 400 }
      );
    }

    // Create the report
    const respoonse = await prisma.$transaction(async (tx) => {
      const report = await tx.reportProduct.create({
        data: {
          product_id: parseInt(product_id, 10),
          factory_id: parseInt(factory_id, 10),
          amount: amount,
          morning_shift_amount: morning_shift_amount
            ? parseFloat(morning_shift_amount)
            : null,
          morning_shift_time: morning_shift_time
            ? new Date(`1970-01-01T${morning_shift_time}`)
            : null,
          afternoon_shift_amount: afternoon_shift_amount
            ? parseFloat(afternoon_shift_amount)
            : null,
          afternoon_shift_time: afternoon_shift_time
            ? new Date(`1970-01-01T${afternoon_shift_time}`)
            : null,
          morning_shift_user_id: morning_shift_user_id
            ? parseInt(morning_shift_user_id, 10)
            : null,
          afternoon_shift_user_id: afternoon_shift_user_id
            ? parseInt(afternoon_shift_user_id, 10)
            : null,
        },
        include: {
          product: true,
          factory: true,
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
      });
      const stock = await tx.stockProduct.create({
        data: {
          product_id: parseInt(product_id, 10),
          amount: amount,
          type: "In",
          report_product_id: report.id,
        },
      });
      return { report, stock };
    });

    return NextResponse.json(respoonse);
  } catch (error: any) {
    console.error("Error creating report:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
