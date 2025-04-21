/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  try {
    const response = await prisma.memberDistributor.findFirst({
      where: {
        user_id: Number(user_id),
      },
    });

    console.log(response);

    if (!response) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const products = await prisma.product.findMany();

    const priceMemberDistributor = await prisma.memberPriceProduct.findMany({
      where: {
        factory_distributor_id: response.factory_distributor_id,
      },
    });

    const result = products.map((product) => {
      const price = priceMemberDistributor.find(
        (price) => price.product_id === product.id
      );
      return {
        ...product,
        price: price?.sale_price || 0,
      };
    });

    return NextResponse.json({
      products: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
