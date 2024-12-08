
"use server";
import prisma from "@/lib/db";
import { PaymentSchema, PaymentFormState } from "@/lib/definitions";

export default async function createPayment(state: PaymentFormState, formData: FormData) {
  const validatedFields = PaymentSchema.safeParse({
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
    await prisma.paymentMethod.update({
      where: { id: parseInt(id) },
      data: { name },
    });
  } else {
    await prisma.paymentMethod.create({ data: { name } });
  }
}