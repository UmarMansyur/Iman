import prisma from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const report = await prisma.reportProduct.findUnique({
      where: { id },
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
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// UPDATE Report
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      amount,
      morning_shift_amount,
      morning_shift_time,
      afternoon_shift_amount,
      afternoon_shift_time,
      type,
    } = body;

    // Validate required field
    if (!amount) {
      return NextResponse.json(
        { message: "Amount is required" },
        { status: 400 }
      );
    }

    const updatedReport = await prisma.reportProduct.update({
      where: { id },
      data: {
        amount,
        morning_shift_amount,
        morning_shift_time: morning_shift_time ? new Date(morning_shift_time) : null,
        afternoon_shift_amount,
        afternoon_shift_time: afternoon_shift_time ? new Date(afternoon_shift_time) : null,
        type: type || undefined,
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
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}