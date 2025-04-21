/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/db";
import { TransactionServiceStatus } from "@prisma/client";
import { uniqueId } from "lodash";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      buyer,
      address,
      cart,
      down_payment,
      payment_method,
      due_date,
      factory_id,
      desc,
      user_id,
    } = data;

    let buyerId: number;
    const result = await prisma.$transaction(async (tx) => {
      const existingBuyer: any = await tx.buyer.findFirst({
        where: {
          name: buyer,
          factory_id: parseInt(factory_id),
          address: address,
        },
      });

      if (!existingBuyer) {
        const newBuyer = await tx.buyer.create({
          data: {
            name: buyer,
            address: address,
            factory_id: parseInt(factory_id),
          },
        });
        buyerId = newBuyer.id;
      } else {
        buyerId = existingBuyer.id;
      }

      const existingServices = await tx.service.findMany({
        where: {
          name: {
            in: cart.map((item: any) => item.service),
          },
          factory_id: parseInt(factory_id),
        },
      });

      const transaction_code = "TS-" + uniqueId() + Date.now();

      const transactionService = await tx.transactionService.create({
        data: {
          user_id: parseInt(user_id),
          transaction_code: transaction_code,
          buyer_id: buyerId,
          amount: cart.reduce(
            (acc: number, item: any) => acc + item.subtotal,
            0
          ),
          desc: desc,
          down_payment: down_payment,
          payment_method_id: parseInt(payment_method),
          maturity_date: new Date(due_date),
          factory_id: parseInt(factory_id),
          remaining_balance:
            cart.reduce((acc: number, item: any) => acc + item.subtotal, 0) -
            down_payment,
        },
      });
      await Promise.all(
        cart.map(async (item: any) => {
          const existingService = existingServices.find(
            (service: any) => service.name === item.service
          );
          if (existingService) {
            await tx.detailTransactionService.create({
              data: {
                service_id: existingService.id,
                amount: item.subtotal,
                price: item.price,
                desc: item.service,
                subtotal: item.subtotal,
                subtotal_discount: item.subtotal_discount,
                transaction_service_id: transactionService.id,
              },
            });
          } else {
            const newService = await tx.service.create({
              data: {
                name: item.service,
                factory_id: parseInt(factory_id),
                price: item.price,
              },
            });

            await tx.detailTransactionService.create({
              data: {
                service_id: newService.id,
                amount: item.subtotal,
                price: item.price,
                desc: item.service,
                subtotal: item.subtotal,
                subtotal_discount: item.subtotal_discount,
                transaction_service_id: transactionService.id,
              },
            });
          }
        })
      );

      return {
        transaction_code: transaction_code,
      };
    });

    return NextResponse.json({
      message: "Transaksi jasa berhasil dibuat",
      data: result,
    });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const user_id = searchParams.get("user_id") || "";
  const skip = (page - 1) * limit;
  const factory_id = searchParams.get("factory_id") || "";
  const status = searchParams.get("status") || ("" as TransactionServiceStatus);
  const filterPayment = searchParams.get("filterPayment") || "";
  const filterStatus = searchParams.get("filterStatus") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  try {
    const where: any = {
      OR: [
        { buyer: { name: { contains: search } } },
        { transaction_code: { contains: search } },
      ],
    };

    if(user_id) {
      where.user_id = parseInt(user_id);
    }

    if(factory_id) {
      where.factory_id = parseInt(factory_id);
    }

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    if (status) {
      where.status = status;
    }

    if (filterPayment == "all") {
      delete where.payment_method_id;
    } else if (filterPayment) {
      where.payment_method_id = parseInt(filterPayment);
    }

    if (filterStatus == "all") {
      delete where.status;
    } else if (filterStatus) {
      where.status = filterStatus as TransactionServiceStatus;
    }

    const total = await prisma.transactionService.count({ where });
    const data = await prisma.transactionService.findMany({
      where,
      skip,
      take: limit,
      include: {
        DetailTransactionService: {
          include: {
            service: true,
          },
        },
        buyer: true,
        payment_method: true,
        user: true,
      },
    });

    return NextResponse.json({
      message: "Transaksi jasa berhasil diambil",
      data: data,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
