// /* eslint-disable @typescript-eslint/no-explicit-any */
// import prisma from "@/lib/db";
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const distributor_id = searchParams.get("distributor_id");
//   const factory_id = searchParams.get("factory_id");

//   const data = await prisma.stockProduct.groupBy({
//     by: ["product_id", "type"],
//     where: {
//       distributor_id: parseInt(distributor_id!),
//       factory_id: parseInt(factory_id!) 
//     },
//     _sum: {
//       amount: true
//     },
//   });

//   // const summary = await prisma.distributorStock.groupBy({
//   //   by: ["type"],
//   //   where: {
//   //     distributor_id: parseInt(distributor_id!),
//   //     factory_id: parseInt(factory_id!)
//   //   },
//   //   _sum: {
//   //     amount: true
//   //   },
//   // });

//   const totalStockIn = data.find(item => item.type === "In")?._sum.amount || 0;
//   const totalStockOut = data.find(item => item.type === "Out")?._sum.amount || 0;

//   const products = await prisma.product.findMany({
//     where: {
//       factory_id: parseInt(factory_id!)
//     }
//   });

//   const memberPrice = await prisma.memberPriceProduct.findMany({
//     where: {
//       product_id: {
//         in: products.map(item => item.id)
//       },
//     }
//   });

//   const result = products.map((product: any) => {
//     const stockIn = data.find((stock: any) => stock.product_id === product.id && stock.type === "In");
//     const stockOut = data.find((stock: any) => stock.product_id === product.id && stock.type === "Out");
//     const price = memberPrice.find((price: any) => price.product_id === product.id)?.sale_price;
//     return {
//       product: {
//         ...product,
//         price: price ? price * 200 : 0,
//         price_per_pack: price ? price : 0
//       },
//       stockIn: stockIn?._sum.amount || 0,
//       stockOut: stockOut?._sum.amount || 0,
//       available_stock: (stockIn?._sum.amount || 0) - (stockOut?._sum.amount || 0)
//     }
//   })

//   return NextResponse.json({
//     status: 200,
//     data: result,
//     summary: {
//       totalStockIn,
//       totalStockOut,
//       availableStock: totalStockIn - totalStockOut,
//       totalProducts: products.length
//     }
//   });
// }
