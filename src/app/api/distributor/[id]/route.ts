/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import prisma from "@/lib/db";

export async function GET(req: Request, { params }: { params: any }) {
  const paramsId = await params;
  const id = paramsId.id;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  const skip = (Number(page) - 1) * Number(limit);

  const users = await prisma.user.findMany();

  const where: any = {
    factory_distributor_id: Number(id),
  };
  if (search) {
    where.name = {
      contains: search,
    };
  }

  try {
    const memberDistributor = await prisma.memberDistributor.findMany({
      where,
      include: {
        User: true,
      },
      skip: skip,
      take: Number(limit),
    });

    const total = await prisma.memberDistributor.count({
      where,
    });

    return NextResponse.json({
      data: memberDistributor,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPage: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: any }) {
  const paramsId = await params;
  const distributorFactoryId = paramsId.id;
  const { distributor_id, user_id, role } = await req.json();


  try {
    const result = await prisma.$transaction(async (tx) => {
      let memberDistributor;
      const factory = await tx.factoryDistributor.findFirst({
        where: {
          id: Number(distributorFactoryId),
        },
        }
      );
      if(!factory) {
        return NextResponse.json(
          { message: "Distributor not found" },
          { status: 400 }
        );
      }
      const roles = await tx.role.findFirst({
        where: {
          role: role,
        },
      });
      if (distributor_id) {
        const result = await tx.memberDistributor.findFirst({
          where: {
            user_id,
            factory_distributor_id: Number(distributorFactoryId),
            NOT: {
              id: Number(distributor_id),
            },
          },
        });
        if (!result) {
          return NextResponse.json(
            { message: "User not found" },
            { status: 400 }
          );
        }
        memberDistributor = await tx.memberDistributor.update({
          where: { id: Number(distributor_id) },
          data: {
            factory_distributor_id: Number(distributorFactoryId),
            user_id: Number(user_id),
          },
        });

        const existingMemberFactory = await tx.memberFactory.findFirst({
          where: {
            user_id: Number(user_id),
            factory_id: Number(factory.factoryId),
            role_id: {
              not: Number(roles?.id),
            },
          },
          include: {
            role: true,
          },
        });

        if (existingMemberFactory) {
          throw new Error(
            "Pengguna ini sudah ditetapkan sebagai " +
              existingMemberFactory.role.role
          );
        }

        // delete member factory dengan user_id dan factory_id yang sama
        await tx.memberFactory.deleteMany({
          where: {
            user_id: Number(user_id),
            factory_id: Number(factory.factoryId),
          },
        });

        const existingMemberFactory2 = await tx.memberFactory.findFirst({
          where: {
            user_id: Number(user_id),
            factory_id: Number(factory.factoryId),
          },
          include: {
            role: true,
          },
        });

        if (!existingMemberFactory2) {
          // create member factory
          await tx.memberFactory.create({
            data: {
              user_id: Number(user_id),
              factory_id: Number(factory.factoryId),
              role_id: Number(roles?.id),
              status: "Active",
            },
          });
        } else {
          throw new Error(
            "Pengguna ini sudah ditetapkan sebagai " +
              existingMemberFactory2.role.role
          );
        }
      } else {
        const result = await tx.memberDistributor.findFirst({
          where: {
            user_id,
            factory_distributor_id: Number(distributorFactoryId),
          },
        });
        

        if (result) {
          return NextResponse.json(
            { message: "User already exists" },
            { status: 400 }
          );
        }
        console.log(distributorFactoryId, user_id, role);
        memberDistributor = await tx.memberDistributor.create({
          data: {
            user_id,
            factory_distributor_id: Number(distributorFactoryId),
          },
        });


        const existingMemberFactory = await tx.memberFactory.findFirst({
          where: {
            user_id: Number(user_id),
            factory_id: Number(factory.factoryId),
          },
          include: {
            role: true,
          },
        });

        if (!existingMemberFactory) {
          await tx.memberFactory.create({
            data: {
              user_id: Number(user_id),
              factory_id: Number(factory.factoryId),
              role_id: Number(roles?.id),
              status: "Active",
            },
          });
        } else {
          throw new Error(
            "Pengguna ini sudah ditetapkan sebagai " +
              existingMemberFactory.role.role
          );
        }
      }
      return memberDistributor;
    });
    return NextResponse.json({
      message: distributor_id ? "Anggota distributor berhasil diubah" : "Anggota distributor berhasil ditambahkan",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  const paramsId = await params;
  const id = paramsId.id;
  const existingMemberDistributor = await prisma.memberDistributor.findFirst({
    where: {
      id: Number(id),
    },
  });

  if (!existingMemberDistributor) {
    return NextResponse.json({ message: "Member distributor not found" }, { status: 404 });
  }

  await prisma.memberDistributor.delete({
    where: { id: Number(id) },
  });
  await prisma.memberFactory.deleteMany({
    where: {
      user_id: existingMemberDistributor.user_id,
      factory_id: existingMemberDistributor.factory_distributor_id,
      role: {
        role: {
          in: ["Owner Distributor", "Distributor"],
        },
      },
    },
  });
  return NextResponse.json({
    message: "Member distributor deleted",
    data: existingMemberDistributor,
  });
}
