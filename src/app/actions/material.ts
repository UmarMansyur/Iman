
"use server";
import prisma from "@/lib/db";
import { UnitFormState, UnitSchema } from "@/lib/definitions";

export default async function createMaterial(state: UnitFormState, formData: FormData) {
  const validatedFields = UnitSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if(!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name } = validatedFields.data;

  if(id) {
    await prisma.material.update({
      where: { id: parseInt(id) },
      data: { name },
    });
  } else {
    await prisma.material.create({ data: { name } });
  }
}