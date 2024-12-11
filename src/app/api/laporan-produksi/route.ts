/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// GET Request - Fetch Reports
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const factoryId = searchParams.get("factoryId");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { product: { name: { contains: search } } },
        { user: { username: { contains: search } } },
      ];
    }
    if (factoryId) {
      where.factory_id = parseInt(factoryId);
    }

    const [data, total] = await Promise.all([
      prisma.reportProduct.findMany({
        where,
        include: {
          product: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              thumbnail: true,
            },
          },
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
      user_id,
      factory_id,
      amount,
      morning_shift_amount,
      morning_shift_time,
      afternoon_shift_amount,
      afternoon_shift_time,
      morning_shift_user_id,
      afternoon_shift_user_id,
      type,
    } = body;

    // Validate required fields
    if (!product_id || !user_id || !factory_id || !amount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Make sure `type` is either "In" or "Out"
    const reportType = type || "In";
    if (!["In", "Out"].includes(reportType)) {
      return NextResponse.json(
        { message: "Invalid type. Must be 'In' or 'Out'" },
        { status: 400 }
      );
    }

    // Create the report
    const report = await prisma.reportProduct.create({
      data: {
        product_id: parseInt(product_id),
        user_id: parseInt(user_id),
        factory_id: parseInt(factory_id),
        amount: parseFloat(amount),
        morning_shift_amount: morning_shift_amount ? parseFloat(morning_shift_amount) : null,
        morning_shift_time: morning_shift_time ? new Date(`1970-01-01T${morning_shift_time}`) : null,
        afternoon_shift_amount: afternoon_shift_amount ? parseFloat(afternoon_shift_amount) : null,
        afternoon_shift_time: afternoon_shift_time ? new Date(`1970-01-01T${afternoon_shift_time}`) : null,
        morning_shift_user_id: morning_shift_user_id ? parseInt(morning_shift_user_id) : null,
        afternoon_shift_user_id: afternoon_shift_user_id ? parseInt(afternoon_shift_user_id) : null,
        type: reportType,
      },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            thumbnail: true,
          },
        },
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

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
