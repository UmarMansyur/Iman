import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const distributor_id = searchParams.get("distributor_id");

  if(!distributor_id) {
    return NextResponse.json({
      status: 400,
      message: "Bad Request",
    });
  }

  const data = await prisma.buyerDistributor.findMany({
    where: {
      distributor_id: parseInt(distributor_id!),
    },
  });

  return NextResponse.json({
    status: 200,
    data: data,
  });
}