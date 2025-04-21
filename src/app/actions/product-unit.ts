// "use server";
// import prisma from "@/lib/db";
// import { ProductUnitFormState, ProductUnitSchema } from "@/lib/definitions";

// export default async function createProductUnit(
//   formState: ProductUnitFormState,
//   formData: FormData
// ) {
//   const validatedFields = ProductUnitSchema.safeParse({
//     id: formData.get("id"),
//     product_id: formData.get("product_id"),
//     unit_id: formData.get("unit_id"),
//     amount: formData.get("amount"),
//     parent_id: formData.get("parent_id"),
//     convert_from_parent: formData.get("convert_from_parent"),
//     factory_id: formData.get("factory_id"),
//   });

//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//     };
//   }

//   const { id, product_id, unit_id, amount, parent_id, convert_from_parent, factory_id } =
//     validatedFields.data;

//   try {
//     if (id) {
//       await prisma.productUnit.update({
//         where: { id: parseInt(id) },
//         data: {
//           product_id: parseInt(product_id),
//           unit_id: parseInt(unit_id),
//           amount: parseFloat(amount),
//           parent_id: parent_id ? parseInt(parent_id) : null,
//           convert_from_parent: convert_from_parent ? parseFloat(convert_from_parent) : null,
//           factoryId: factory_id ? parseInt(factory_id) : null,
//         },
//       });
//       return {
//         message: "Satuan produk berhasil diperbarui",
//       };
//     }
//     await prisma.productUnit.create({
//       data: {
//         product_id: parseInt(product_id),
//         unit_id: parseInt(unit_id),
//         amount: parseInt(amount),
//         parent_id: parent_id ? parseInt(parent_id) : null,
//         convert_from_parent: convert_from_parent ? parseInt(convert_from_parent) : null,
//         factoryId: factory_id ? parseInt(factory_id) : null,
//       },
//     });
//     return {
//       message: "Satuan produk berhasil dibuat",
//     };
//   } catch (error: any) {
//     return {
//       message: error.message || "Gagal membuat satuan produk",
//     };
//   }
// }
