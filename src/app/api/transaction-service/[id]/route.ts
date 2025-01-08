/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/db";
import { TransactionServiceStatus } from "@prisma/client";
import { uniqueId } from "lodash";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const paramsId = await params.id;
    const id = parseInt(paramsId);
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
  
      const transactionService = await tx.transactionService.update({
        where: { id: id },
        data: {
          user_id: parseInt(user_id),
          transaction_code: transaction_code,
          buyer_id: buyerId,
          amount: cart.reduce((acc: number, item: any) => acc + item.subtotal, 0),
          desc: desc,
          down_payment: down_payment,
          payment_method_id: parseInt(payment_method),
          maturity_date: new Date(due_date),
          remaining_balance: cart.reduce((acc: number, item: any) => acc + item.subtotal, 0) - down_payment,
        },
      });
      await tx.detailTransactionService.deleteMany({
        where: {
          transaction_service_id: id,
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
  
    return NextResponse.json({ message: "Transaksi jasa berhasil dibuat", data: result });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: any }) {
  const paramsId = await params.id;
  const id = parseInt(paramsId);
  const data = await req.json();
  const { status, proof_of_payment } = data;
  
  const existingTransactionService: any = await prisma.transactionService.findUnique({
    where: { id: id },
  });

  if(existingTransactionService.status === "Paid_Off") {
    return NextResponse.json({ message: "Transaksi jasa sudah selesai" }, { status: 400 });
  }

  let remaining_balance = existingTransactionService.remaining_balance;

  if(status === "Paid_Off") {
    remaining_balance = 0;
  }

  await prisma.transactionService.update({
    where: { id: id },
    data: { status: status as TransactionServiceStatus, proof_of_payment: proof_of_payment, remaining_balance: remaining_balance },
  });

  return NextResponse.json({ message: "Status transaksi jasa berhasil diubah" });
}

export async function DELETE(req: Request, { params }: { params: any }) {
  const paramsId = await params.id;
  const id = parseInt(paramsId);
  await prisma.transactionService.delete({
    where: { id: id },
  });
  return NextResponse.json({ message: "Transaction service deleted successfully" });
}

export async function GET(req: Request, { params }: { params: any }) {
  const paramsId = await params.transaction_code;
  try {
    const transactionService = await prisma.transactionService.findFirst({
      where: { transaction_code: paramsId },
      include: {
        buyer: true,
        factory: true,
        DetailTransactionService: {
          include: {
            service: true
          }
        },
        payment_method: true,
        user: true
      }
    });
    return NextResponse.json(transactionService);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

