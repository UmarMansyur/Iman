/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const factory_id = searchParams.get("factory_id") || "";
    const user_id = searchParams.get("user_id") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "id";

    const member_factory = await prisma.memberFactory.findFirst({
      where: {
        user_id: parseInt(user_id),
        factory_id: parseInt(factory_id),
      },
    });


    if (!member_factory) {
      throw new Error("Member factory tidak ditemukan!");
    }

    const where: Prisma.MemberPriceProductWhereInput = {
      factory_id: parseInt(factory_id),
      user_id: parseInt(user_id),
    };

    if (search) {
      where.OR = [
        {
          product: {
            name: {
              contains: search,
            },
          },
        },
      ];
    }

    const response = await prisma.memberPriceProduct.findMany({
      where: {
        ...where,
      },
      include: {
        product: true,
      },
      orderBy: {
        [sortBy]: "asc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.memberPriceProduct.count({
      where: {
        factory_id: parseInt(factory_id),
        user_id: parseInt(user_id),
      },
    });

    const data = response.map((item: any) => {
      return {
        id: item.id,
        product_id: item.product_id,
        name: item.product.name + " - " + item.product.type,
        price: item.price,
        sale_price: item.price,
      };
    });

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json({ data, pagination });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { factory_id, product_id, user_id, price, sale_price } =
      await req.json();

    const member_factory = await prisma.memberFactory.findFirst({
      where: {
        user_id: parseInt(user_id),
        factory_id: parseInt(factory_id),
      },
    });

    if (!member_factory) {
      throw new Error("Member factory not found");
    }

    const existingMemberPriceProduct =
      await prisma.memberPriceProduct.findFirst({
        where: {
          factory_id: parseInt(factory_id),
          member_factory_id: member_factory.id,
          product_id: parseInt(product_id),
        },
      });

    if (existingMemberPriceProduct) {
      throw new Error(
        "Produk sudah ditambahkan!, edit produk untuk mengubah harga"
      );
    }

    const memberPriceProduct = await prisma.memberPriceProduct.create({
      data: {
        factory_id: parseInt(factory_id),
        member_factory_id: member_factory.id,
        product_id: parseInt(product_id),
        price: parseInt(price),
        sale_price: parseInt(sale_price),
        user_id: parseInt(user_id),
      },
    });

    return NextResponse.json(memberPriceProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "";

    const { factory_id, product_id, user_id, price, sale_price } =
      await req.json();

    const member_factory = await prisma.memberFactory.findFirst({
      where: {
        user_id: parseInt(user_id),
        factory_id: parseInt(factory_id),
      },
    });

    if (!member_factory) {
      throw new Error("Member factory not found");
    }

    const existingMemberPriceProduct =
      await prisma.memberPriceProduct.findFirst({
        where: {
          factory_id: parseInt(factory_id),
          member_factory_id: member_factory.id,
          product_id: parseInt(product_id),
          NOT: {
            id: parseInt(id),
          },
        },
      });

    if (existingMemberPriceProduct) {
      throw new Error(
        "Jangan mengedit produk dengan data produk yang sudah ditambahkan!"
      );
    }

    const memberPriceProduct = await prisma.memberPriceProduct.update({
      where: {
        id: parseInt(id),
      },
      data: {
        factory_id: parseInt(factory_id),
        member_factory_id: member_factory.id,
        product_id: parseInt(product_id),
        price: parseInt(price),
        sale_price: parseInt(sale_price),
        user_id: parseInt(user_id),
      },
    });

    return NextResponse.json(memberPriceProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";

  await prisma.memberPriceProduct.delete({
    where: {
      id: parseInt(id as string),
    },
  });

  return NextResponse.json(
    { message: "Satuan berhasil dihapus" },
    { status: 200 }
  );
}