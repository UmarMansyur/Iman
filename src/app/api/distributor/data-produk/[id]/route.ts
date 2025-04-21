import prisma from "@/lib/db";
import { NextResponse } from "next/server";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const paramsId = await params;
    const id = paramsId.id;
    const memberPriceProduct = await prisma.memberPriceProduct.findFirst({
      where: {
        id: parseInt(id),
      },
      include: {
        product: true,
      },
    });

    if (!memberPriceProduct) {
      throw new Error("Member product not found!");
    }
    const response = await prisma.memberPriceProduct.delete({
      where: {
        id: parseInt(id),
      },
    });

    if (memberPriceProduct?.product?.factory_id == null) {
      await prisma.product.delete({
        where: {
          id: memberPriceProduct?.product_id,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Member product berhasil dihapus!",
        data: response,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 400,
      }
    );
  }
}
