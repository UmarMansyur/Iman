'use server'
import prisma from "@/lib/db";
import { MaterialStockFormState, MaterialStockSchema } from "@/lib/definitions";
import { MaterialStockStatus } from "@prisma/client";

export const createMaterialStock = async (state: MaterialStockFormState, formData: FormData) => {
  const validatedSchema = MaterialStockSchema.safeParse({
    id: formData.get("id") || undefined,
    material_unit_id: formData.get("material_unit_id") || undefined,
    amount: formData.get("amount") || undefined,
  });

  if (!validatedSchema.success) {
    return {
      errors: validatedSchema.error.flatten().fieldErrors,
    };
  }

  const { material_unit_id, amount, status } = validatedSchema.data;

  const factory = await prisma.materialUnit.findFirst({
    where: {
      id: Number(material_unit_id),
    },
  });

  if(!factory) {
    return {
      errors: {
        material_unit_id: "Material unit tidak ditemukan",
      },
    };
  }

  await prisma.materialStock.create({
    data: {
      factory_id: factory.id,
      material_unit_id: Number(material_unit_id),
      amount: Number(amount),
      status: status as MaterialStockStatus,
    },
  });
};