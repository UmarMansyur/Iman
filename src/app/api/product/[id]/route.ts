import prisma from "@/lib/db";
import { NextResponse } from "next/server";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET(request: Request, { params }: { params: any }) {
  const { id } = params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
