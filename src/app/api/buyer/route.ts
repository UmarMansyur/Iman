/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const factory_id = searchParams.get("factory_id") || "";
  const search = searchParams.get("search") || "";

  const where: Prisma.BuyerWhereInput = {
    factory_id: parseInt(factory_id),
  };

  if (search) {
    where.name = {
      contains: search,
    };
  }

  try {
    const buyers = await prisma.buyer.findMany({
      where,
    });

    return NextResponse.json(buyers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { name, address, factory_id } = await req.json();
  try {

    const existingBuyer = await prisma.buyer.findFirst({
      where: {
        name: name,
        factory_id: parseInt(factory_id),
      },
    });

    if (existingBuyer) {
      return NextResponse.json({ error: "Buyer already exists" }, { status: 400 });
    }

    const buyer = await prisma.buyer.create({
      data: { name, address, factory_id: parseInt(factory_id) },
    });

    return NextResponse.json(buyer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
