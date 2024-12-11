/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from "@/lib/db";
import { ProductFormState, ProductSchema } from "@/lib/definitions";

export default async function createProduct(
  state: ProductFormState,
  formData: FormData
) {
  const validatedFields = ProductSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    type: formData.get("type"),
    factory_id: formData.get("factory_id"),
    price: formData.get("price"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, type, factory_id, price } = validatedFields.data;

  try {
    if (id) {
      await prisma.product.update({
        where: { id: parseInt(id) },
        data: { name, type, price: parseInt(price) },
      });
    } else {
      await prisma.product.create({
        data: { name, type, factory_id: parseInt(factory_id), price: parseInt(price) },
      });
    }
    return {
      message: "Produk berhasil dibuat",
    };
  } catch (error: any) {
    return {
      message: error.message || "Gagal membuat produk",
    };
  }
}
