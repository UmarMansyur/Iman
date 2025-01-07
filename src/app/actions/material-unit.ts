/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from "@/lib/db";
import { MaterialUnitFormState, MaterialUnitSchema } from "@/lib/definitions";

export default async function createMaterialUnit(
  formState: MaterialUnitFormState,
  formData: FormData
) {
  const validatedFields = MaterialUnitSchema.safeParse({
    id: formData.get("id"),
    material_id: formData.get("material_id"),
    unit_id: formData.get("unit_id"),
    factory_id: formData.get("factory_id")
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, material_id, unit_id, factory_id } = validatedFields.data;
  try {
    const existingMaterial: any = await prisma.material.findFirst({
      where: {
        factory_id: parseInt(factory_id),
        name: material_id
      }
    });

    if (!existingMaterial) {
      const material = await prisma.material.create({
        data: {
          name: material_id,
          factory_id: parseInt(factory_id),
        },
      });
      existingMaterial.id = material.id;
    }

    if (id) {
      await prisma.materialUnit.update({
        where: { id: parseInt(id) },
        data: {
          material_id: parseInt(existingMaterial.id),
          unit_id: parseInt(unit_id),
        },
      });
      return {
        message: "Satuan material berhasil diperbarui",
      };
    }
    await prisma.materialUnit.create({
      data: {
        material_id: parseInt(existingMaterial.id),
        unit_id: parseInt(unit_id),
      },
    });
    return {
      message: "Satuan material berhasil dibuat",
    };
  } catch (error: any) {
    return {
      message: error.message || "Gagal membuat satuan material",
    };
  }
}
