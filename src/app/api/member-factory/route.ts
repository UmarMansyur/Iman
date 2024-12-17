/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role_id = searchParams.get("role_id") || "";
  const factory_id = searchParams.get("factory_id") || "";

  try {
    const members = await prisma.memberFactory.findMany({
      where: {
        role_id: parseInt(role_id),
        factory_id: parseInt(factory_id),
      },
      include: {
        user: true,
      },
    });

    const result = members.map((item: any) => {
      return {
        id: item.user.id,
        name: item.user.username,
        address: item.user.address,
        role_id: item.role_id,
        thumbnail: item.user.thumbnail,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
