import prisma from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const factoryId = parseInt(searchParams.get("factoryId") || "0");

    const where: any = {
      OR: [
        { user: { name: { contains: search } } },
        { factory: { name: { contains: search } } },
      ],
      factory_id: factoryId,
    };

    const operator = await prisma.memberFactory.findMany({
      where,
      include: {
        user: true,
        factory: true,
        role: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const operators = operator.map((item) => ({
      id: item.id,
      factory_id: item.factory_id,
      user_id: item.user_id,
      role_id: item.role_id,
      name: item.user?.username,
      role: item.role?.role,
      status: item.status,
    }));

    const total = await prisma.memberFactory.count({ where });

    return NextResponse.json({
      data: operators,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.memberFactory.delete({ where: { id } });
    return NextResponse.json({ message: "Operator deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}