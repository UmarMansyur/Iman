/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 10;
  const search = searchParams.get("search") || "";
  const skip = (Number(page) - 1) * Number(limit);
  const type_preorder = searchParams.get("type_preorder") || "";
  const user_id = searchParams.get("user_id") || "";

  try {
    const where: any = {};

    if (search) {
      where.order_code = {
        contains: search,
      };
    }

    if (user_id) {
      const existMemberDistributor = await prisma.memberDistributor.findFirst({
        where: {
          user_id: Number(user_id),
        },
      });

      if (!existMemberDistributor) {
        return NextResponse.json({
          message: "Gagal, data member distributor tidak ditemukan",
        });
      }

      where.distributor_id = {
        equals: existMemberDistributor.id,
      };
    }

    if (type_preorder) {
      where.type_preorder = type_preorder === "true" ? true : false;
    }

    const order = await prisma.orderBahanBakuDistributor.findMany({
      where,
      include: {
        DetailOrderBahanBakuDistributor: {
          include: {
            material_distributor: {
              include: {
                unit: true,
              }
            }
          }
        },
        distributor: true,
        factoryDistributor: true
      },
      skip,
      take: Number(limit),
    });

    const total = await prisma.orderBahanBakuDistributor.count({
      where,
    });

    const pagination = {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(Number(total) / Number(limit)),
    };

    return NextResponse.json({
      message: "Berhasil, data order bahan baku berhasil diambil",
      data: order,
      pagination,
    });
  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    });
  }
}

export async function POST(req: Request) {
  const {
    name,
    user_id,
    desc,
    type_preorder,
    details: detail_order,
  } = await req.json();
  try {
    const factory_distributor = await prisma.memberDistributor.findFirst({
      where: {
        user_id: Number(user_id),
      },
    });

    if (!factory_distributor) {
      return NextResponse.json({
        message: "Gagal, data factory distributor tidak ditemukan",
      });
    }

    console.log(type_preorder)

    const order = await prisma.orderBahanBakuDistributor.create({
      data: {
        distributor_id: Number(user_id),
        factory_distributor_id: Number(factory_distributor.id),
        factory: name,
        desc: desc,
        total: detail_order.reduce(
          (acc: number, item: any) => acc + Number(item.sub_total),
          0
        ),
        type_preorder: type_preorder,
        DetailOrderBahanBakuDistributor: {
          createMany: {
            data: detail_order.map((item: any) => ({
              material_distributor_id: Number(item.material_distributor_id),
              amount: Number(item.amount),
              amount_received: type_preorder == false ? Number(item.amount) : 0,
              price: Number(item.price),
              sub_total: Number(item.sub_total),
            })),
          },
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Berhasil, data order bahan baku berhasil dibuat",
        data: order,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const exist = await prisma.orderBahanBakuDistributor.findFirst({
      where: {
        id: Number(id)
      }
    });

    console.log(exist);

    if (!exist) {
      throw new Error("Order tidak ditemukan");
    }

    const response = await prisma.orderBahanBakuDistributor.delete({
      where: {
        id: Number(id)
      }
    });

    return NextResponse.json({
      message: "Order berhasil dihapus",
      data: response,
    });

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    });
  }
}