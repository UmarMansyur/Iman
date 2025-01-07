/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const {
        buyer_id,
        services,
        desc,
        amount,
        down_payment,
        user_id,
      } = req.body;

      const transaction = await prisma.transactionService.create({
        data: {
          transaction_code: `TRX-${Date.now()}`,
          buyer_id,
          user_id,
          desc,
          amount,
          down_payment: down_payment || 0,
          remaining_balance: amount - (down_payment || 0),
          DetailTransactionService: {
            createMany: {
              data: services.map((service: any) => ({
                service_id: service.service_id,
                desc: service.desc,
                amount: service.amount,
                price: service.price,
              })),
            },
          },
        },
        include: {
          DetailTransactionService: true,
        },
      });

      return res.status(200).json({ 
        message: "Transaksi berhasil dibuat",
        data: transaction 
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}