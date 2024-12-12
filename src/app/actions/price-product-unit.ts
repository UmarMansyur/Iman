// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use server";
// import prisma from "@/lib/db";
// import { PriceProductUnitFormState, PriceProductUnitSchema } from "@/lib/definitions";

// export default async function createPriceProductUnit(
//   formState: PriceProductUnitFormState,
//   formData: FormData
// ) {
//   const validatedFields = PriceProductUnitSchema.safeParse({
//     id: formData.get("id"),
//     product_unit_id: formData.get("product_unit_id"),
//     price: formData.get("price"),
//     sale_price: formData.get("sale_price"),
//     status: formData.get("status"),
//   });

//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//     };
//   }

//   const { id, product_unit_id, price, sale_price, status } =
//     validatedFields.data;

//   try {
//     if (id) {
//       // nonaktifkan harga produk jika product_unit_id sama
//       if(status === "Active") {
//         await prisma.priceProductUnit.updateMany({
//           where: {
//             product_unit_id: parseInt(product_unit_id),
//             id: {
//               not: parseInt(id)
//             }
//           },
//           data: {
//             status: "Inactive"
//           }
//         });
//       }
//       await prisma.priceProductUnit.update({
//         where: { id: parseInt(id) },
//         data: {
//           product_unit_id: parseInt(product_unit_id),
//           price: parseFloat(price),
//           sale_price: parseFloat(sale_price),
//           status: status,
//         },
//       });
//       return {
//         message: "Harga produk berhasil diperbarui",
//       };
//     }
//     await prisma.priceProductUnit.updateMany({
//       where: {
//         product_unit_id: parseInt(product_unit_id)
//       },
//       data: {
//         status: "Inactive"
//       }
//     });
//     await prisma.priceProductUnit.create({
//       data: {
//         product_unit_id: parseInt(product_unit_id),
//         price: parseFloat(price),
//         sale_price: parseFloat(sale_price),
//         status: status,
//       },
//     });
//     return {
//       message: "Harga produk berhasil dibuat",
//     };
//   } catch (error: any) {
//     return {
//       message: error.message || "Gagal membuat harga produk",
//     };
//   }
// }
