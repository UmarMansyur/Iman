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
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, type, factory_id } = validatedFields.data;

  try {
    if (id) {
      await prisma.product.update({
        where: { id: parseInt(id) },
        data: { name, type },
      });
    } else {
      await prisma.product.create({
        data: { name, type, factory_id: parseInt(factory_id) },
      });
    }
    return {
      message: "Produk berhasil dibuat",
    };
  } catch (error) {
    return {
      message: "Gagal membuat produk",
    };
  }
}
