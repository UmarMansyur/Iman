
"use server";
import prisma from "@/lib/db";
import { RoleFormState, RoleSchema } from "@/lib/definitions";

export default async function createRole(state: RoleFormState, formData: FormData) {
  const validatedFields = RoleSchema.safeParse({
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
    await prisma.role.update({
      where: { id: parseInt(id) },
      data: { role: name },
    });
  } else {
    await prisma.role.create({ data: { role: name } });
  }
}