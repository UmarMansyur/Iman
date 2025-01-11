import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const distributor_id = searchParams.get("distributor_id");
  const factory_id = searchParams.get("factory_id");

  if(!distributor_id || !factory_id) {
    return NextResponse.json({
      status: 400,
      message: "Bad Request",
    });
  }

  const data = await prisma.buyerDistributor.findMany({
    where: {
      distributor_id: parseInt(distributor_id!),
      factory_id: parseInt(factory_id!),
    },
  });

  return NextResponse.json({
    status: 200,
    data: data,
  });
}