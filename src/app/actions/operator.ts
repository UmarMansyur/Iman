/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { MemberFactoryFormState, MemberFactorySchema } from "@/lib/definitions";
import { MemberFactoryStatus } from "@prisma/client";

export async function createOperator(state: MemberFactoryFormState, formData: FormData) {
  const validatedFields = MemberFactorySchema.safeParse({
    id: formData.get("id") as string,
    factory_id: formData.get("factory_id") as string,
    user_id: formData.get("user_id") as string,
    role_id: formData.get("role_id") as string,
    status: formData.get("status") as MemberFactoryStatus,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data",
    };
  }

  const { id, factory_id, user_id, role_id, status } = validatedFields.data;

  try {
    let memberFactory;
    if(id) {
      memberFactory = await prisma.memberFactory.update({
        where: { id: parseInt(id) },
        data: {
          factory_id: parseInt(factory_id),
          user_id: parseInt(user_id),
          role_id: parseInt(role_id),
          status: status as MemberFactoryStatus,
        },
      });
    } else {
      memberFactory = await prisma.memberFactory.create({
        data: {
          factory_id: parseInt(factory_id),
          user_id: parseInt(user_id),
          role_id: parseInt(role_id),
          status: status as MemberFactoryStatus,
      },
      });
    }
    return {
      message: "Operator created successfully",
      data: memberFactory,
    };
  } catch (error: any) {
    return {
      errors: {
        message: error.message,
      },
    };
  }
}