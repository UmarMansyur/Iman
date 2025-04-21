/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const factory_id = searchParams.get("factory_id") || "";
    const user_id = searchParams.get("user_id") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    let sortBy = searchParams.get("sortBy") || "id";
    const orderBy = searchParams.get("orderBy") || "asc";
    const isFactory = searchParams.get("isFactory") || "semua";

    const whereFactory: any = {};
    if (Number(factory_id) > 0) {
      whereFactory.factory_id = parseInt(factory_id);
    } else {
      delete whereFactory.factory_id;
    }

    const memberDistributor = await prisma.memberDistributor.findFirst({
      where: {
        user_id: parseInt(user_id),
      },
    });

    if (!memberDistributor) {
      throw new Error("Member distributor tidak ditemukan!");
    }

    const where: any = {};

    if (Number(factory_id) > 0) {
      where.factory_id = parseInt(factory_id);
    } else {
      delete where.factory_id;
    }

    if (Number(memberDistributor.factory_distributor_id) > 0) {
      where.factory_distributor_id = memberDistributor.factory_distributor_id;
    }

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

    if (isFactory == "semua") {
      delete where.factory_id;
    }

    if (isFactory == "pabrik") {
      where.factory_id = {
        not: null,
      };
    }

    if(isFactory == "non-pabrik") {
      where.factory_id = null;
    }

    const sortByFactory: any = {};
    if (sortBy == "factory") {
      sortByFactory.factory = { name: orderBy };
      sortBy = "id";
    }

    const response = await prisma.memberPriceProduct.findMany({
      where: {
        ...where,
      },
      include: {
        product: {
          include: {
            factory: true,
          },
        },
        factory: true,
      },
      orderBy: {
        ...sortByFactory,
        [sortBy]: orderBy,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.memberPriceProduct.count({
      where: {
        ...where,
      },
    });

    const listProduct = await prisma.product.findMany({
      where: {
        NOT: {
          id: {
            in: response.map((item: any) => item.product_id),
          },
        },
      },
    });

    const listProducts = listProduct.map((item) => {
      return {
        id: item.id,
        name: item.name + " - " + item.type,
        price: item.price,
        factory_id: item.factory_id,
        per_bal: item.per_bal,
        per_karton: item.per_karton,
        per_slop: item.per_slop,
      };
    });

    const data = response.map((item: any) => {
      return {
        id: item.id,
        product_id: item.product_id,
        name: item.product.name + " - " + item.product.type,
        price: item.price,
        sale_price: item.sale_price,
        factory_id: item.factory_id,
        product_type: item.product.type,
        factory: {
          name: item.product?.factory?.name || "Non Pabrik",
        },
        per_bal: item.product.per_bal,
        per_karton: item.product.per_karton,
        per_slop: item.product.per_slop,
      };
    });

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    const options = {
      products: [...listProducts],
    };

    return NextResponse.json({ data, pagination, options });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      factory_id,
      product_id,
      user_id,
      sale_price,
      factory_distributor_id,
      product_type,
      purchase_price,
      per_bal,
      per_karton,
      per_slop,
    } = await req.json();
    let factory_distributor = null;

    if (!factory_distributor_id) {
      const memberFactory = await prisma.memberDistributor.findFirst({
        where: {
          user_id: parseInt(user_id),
        },
      });
      if (!memberFactory) {
        throw new Error("Member distributor tidak ditemukan!");
      }
      factory_distributor = memberFactory.factory_distributor_id;
    } else {
      factory_distributor = factory_distributor_id;
    }

    const where: any = {};

    if (Number(factory_distributor_id) > 0) {
      where.factory_distributor_id = factory_distributor;
    } else {
      where.factory_distributor_id = parseInt(factory_id);
    }

    if (!isNaN(Number(factory_id))) {
      where.factory_id = parseInt(factory_id);
    }

    if (!isNaN(Number(product_id))) {
      where.product_id = parseInt(product_id);
    } else {
      where.product = {
        name: product_id,
        type: product_type,
      };
    }

    // jika factory_distributor tidak ada maka throw error
    if (!factory_distributor) {
      throw new Error("Factory distributor tidak ditemukan!");
    }

    return await prisma.$transaction(async (tx) => {
      // Cek existing product
      const existingMemberPriceProduct = await tx.memberPriceProduct.findFirst({
        where: {
          ...where,
          factory_distributor_id: Number(factory_distributor),
        },
      });

      if (existingMemberPriceProduct) {
        throw new Error(
          "Produk sudah ditambahkan!, edit produk untuk mengubah harga"
        );
      }

      let memberPriceProduct = null;

      if (!isNaN(Number(product_id))) {
        const existProduct = await tx.product.findFirst({
          where: {
            id: parseInt(product_id),
          },
        });

        if (!existProduct) {
          throw new Error("Produk tidak ditemukan");
        }

        memberPriceProduct = await tx.memberPriceProduct.create({
          data: {
            product_id: parseInt(product_id),
            price: existProduct.price,
            factory_id: existProduct.factory_id || null,
            sale_price: Number(sale_price),
            factory_distributor_id: Number(factory_distributor),
          },
        });
      } else {
        const existProducts = await tx.product.findFirst({
          where: {
            name: product_id,
            type: product_type,
          },
        });

        if (existProducts) {
          throw new Error("Produk sudah ada!");
        }

        const product = await tx.product.create({
          data: {
            name: product_id,
            type: product_type,
            price: Number(purchase_price),
            per_bal: Number(per_bal),
            per_karton: Number(per_karton),
            per_slop: Number(per_slop),
          },
        });

        memberPriceProduct = await tx.memberPriceProduct.create({
          data: {
            product_id: product.id,
            factory_id: product.factory_id || null,
            price: Number(purchase_price),
            sale_price: Number(sale_price),
            factory_distributor_id: Number(factory_distributor),
          },
        });
      }

      return NextResponse.json({
        message: "Produk berhasil ditambahkan",
        data: memberPriceProduct,
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = body.id;

    const {
      product_id,
      sale_price,
      purchase_price,
      per_bal,
      per_karton,
      per_slop,
    } = body;


    const existingMemberPriceProductId =
      await prisma.memberPriceProduct.findFirst({
        where: {
          id: parseInt(id),
        },
      });

    if (!existingMemberPriceProductId) {
      throw new Error("Produk tidak ditemukan!");
    }

    const existingMemberPriceProduct =
      await prisma.memberPriceProduct.findFirst({
        where: {
          factory_id: existingMemberPriceProductId.factory_id,
          factory_distributor_id:
            existingMemberPriceProductId.factory_distributor_id,
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

    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(product_id),
      },
    });

    if(!product) {
      throw new Error("Produk tidak ditemukan!");
    }

    const inputData = {
      price: Number(purchase_price),
    }

    if(product?.factory_id == null) {
      inputData.price = Number(purchase_price);
    }

    const memberPriceProduct = await prisma.memberPriceProduct.update({
      where: {
        id: parseInt(id),
      },
      data: {
        factory_id: product?.factory_id,
        product_id: parseInt(product_id),
        ...inputData,
        sale_price: Number(sale_price),
      },
    });

    if (product?.factory_id == null) {
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          price: Number(purchase_price),
          per_bal: Number(per_bal),
          per_karton: Number(per_karton),
          per_slop: Number(per_slop),
        },
      });
    }

    return NextResponse.json({
      message: "Produk berhasil diubah",
      data: {
        memberPriceProduct,
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";

  const memberPriceProduct = await prisma.memberPriceProduct.findFirst({
    where: {
      id: parseInt(id as string),
    },
    include: {
      product: true,
    },
  });

  await prisma.memberPriceProduct.delete({
    where: {
      id: parseInt(id as string),
    },
  });

  // jika factory_idnya pada product tidak ada maka hapus juga produk
  if (memberPriceProduct?.product?.factory_id == null) {
    const response = await prisma.product.delete({
      where: {
        id: memberPriceProduct?.product_id,
      },
    });
    console.log(response);
  }

  return NextResponse.json(
    { message: "Produk berhasil dihapus" },
    { status: 200 }
  );
}
