import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");
  const factory_id = searchParams.get("factory_id");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where = {
    factory_id: Number(factory_id),
    created_at: {
      gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
      lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
    }
  }


  const memberDistributor = await prisma.memberDistributor.findFirst({
    where: {
      user_id: Number(user_id)
    }
  });

  const distributors = await prisma.memberDistributor.findMany({
    where: {
      factory_distributor_id: memberDistributor?.factory_distributor_id
    }
  });

  const totalPreOrder = await prisma.invoice.count({
    where: {
      distributor_id: {
        in: distributors.map(distributor => distributor.distributor_id)
      }
    }
  });

  // total pre order
}