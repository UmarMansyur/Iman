/* eslint-disable @typescript-eslint/no-explicit-any */
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
        { user: { username: { contains: search } } },
        { factory: { name: { contains: search } } },
      ],

      factory_id: factoryId,
    };

    const orderBy: any = {};

    if (sortBy === "status") {
      orderBy.status = sortOrder;
    }

    if (sortBy === "role") {
      orderBy.role_id = sortOrder;
    }

    if (sortBy === "name") {
      orderBy.user = {
        username: sortOrder,
      };
    }

    if (sortBy === "id") {
      orderBy.id = sortOrder;
    }

    const operator = await prisma.memberFactory.findMany({
      where: {
        ...where,
        role: {
          role: "Operator",
        },
      },
      include: {
        user: true,
        factory: true,
        role: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
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

    const total = await prisma.memberFactory.count({
      where: {
        ...where,
        role: {
          role: "Operator",
        },
      },
    });

    return NextResponse.json(
      {
        data: operators,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const user_id = formData.get("user_id") as string;
  const role_id = formData.get("role_id") as string;
  const factory_id = formData.get("factory_id") as string;
  const id = formData.get("id") as string;
  try {
    if (id) {
      const memberFactory = await prisma.memberFactory.update({
        where: { id: parseInt(id) },
        data: {
          user_id: parseInt(user_id),
          role_id: parseInt(role_id),
          factory_id: parseInt(factory_id),
          status: "Active",
        },
      });
      return NextResponse.json(
        { message: "Operator berhasil diubah", data: memberFactory },
        { status: 200 }
      );
    }
    const memberFactory = await prisma.memberFactory.create({
      data: {
        user_id: parseInt(user_id),
        role_id: parseInt(role_id),
        factory_id: parseInt(factory_id),
        status: "Active",
      },
    });

    return NextResponse.json(
      { message: "Operator berhasil ditambahkan", data: memberFactory },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    await prisma.memberFactory.delete({ where: { id: parseInt(id) } });
    return NextResponse.json(
      { message: "Operator berhasil dihapus" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
