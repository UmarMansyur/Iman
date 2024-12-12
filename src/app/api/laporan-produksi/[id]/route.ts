/* eslint-disable @typescript-eslint/no-explicit-any */
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
        afternoon_shift_user: true,
        morning_shift_user: true,
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
      morning_shift_amount,
      morning_shift_time,
      morning_shift_user_id,
      afternoon_shift_amount,
      afternoon_shift_user_id,
      afternoon_shift_time,
    } = body;

    // amount adalah jumlah produk dari morning_shift_amount dan afternoon_shift_amount
    const amount =
      Number(morning_shift_amount) + Number(afternoon_shift_amount);

    const updatedReport = await prisma.$transaction(async (tx) => {
      const report = await tx.reportProduct.update({
        where: { id: Number(id) },
        data: {
          amount,
          morning_shift_amount,
          morning_shift_time: morning_shift_time
            ? new Date("1970-01-01T" + morning_shift_time)
            : null,
          morning_shift_user_id: morning_shift_user_id
            ? parseInt(morning_shift_user_id, 10)
            : undefined,
          afternoon_shift_amount,
          afternoon_shift_time: afternoon_shift_time
            ? new Date("1970-01-01T" + afternoon_shift_time)
            : null,
          afternoon_shift_user_id: afternoon_shift_user_id
            ? parseInt(afternoon_shift_user_id, 10)
            : undefined,
        },
        include: {
          product: true,
          factory: true,
        },
      });
      const existStock = await tx.stockProduct.findFirst({
        where: {
          report_product_id: report.id,
        },
      });
      if (!existStock) {
        const stock = await tx.stockProduct.create({
          data: {
            product_id: report.product_id,
            amount: amount,
            type: "In",
            report_product_id: report.id,
          },
        });
        return { report, stock };
      } else {
        const stock = await tx.stockProduct.update({
          where: { id: existStock.id },
          data: { amount: report.amount },
        });
        return { report, stock };
      }
    });

    return NextResponse.json(updatedReport);
  } catch (error: any) {
    console.error("Error updating report:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  await prisma.reportProduct.delete({ where: { id } });
  return NextResponse.json({ message: "Report deleted successfully" });
}
