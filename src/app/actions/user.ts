/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from "@/lib/db";
import {
  UpdateUserFormState,
  UpdateUserSchema,
  UserFormState,
  UserSchema,
} from "@/lib/definitions";
import { Gender, UserType } from "@prisma/client";
import bcrypt from "bcrypt";
import { deleteFile, uploadFile } from "@/lib/imagekit";

export async function createUser(state: UserFormState, formData: FormData) {
  const validatedFields = UserSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    gender: formData.get("gender"),
    date_of_birth: formData.get("date_of_birth"),
    address: formData.get("address"),
    user_type: formData.get("user_type"),
    thumbnail: formData.get("thumbnail"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  // hit api in here
  try {
    const hashedPassword = await bcrypt.hash(
      formData.get("password") as string,
      10
    );
    const thumbnail = formData.get("thumbnail") as File;
    let thumbnailUrl = null;
    if (thumbnail && thumbnail.size > 0) {
      const fileObject = {
        buffer: Buffer.from(await thumbnail.arrayBuffer()),
        originalname: thumbnail.name,
        mimetype: thumbnail.type,
      };
      thumbnailUrl = await uploadFile(fileObject);
    }
    await prisma.user.create({
      data: {
        email: formData.get("email") as string,
        username: formData.get("username") as string,
        password: hashedPassword,
        gender: formData.get("gender") as Gender,
        date_of_birth: new Date(formData.get("date_of_birth") as string),
        thumbnail: thumbnailUrl,
        address: formData.get("address") as string,
        user_type: (formData.get("user_type") as UserType) || "Operator",
        is_active: true,
        is_verified: true,
      },
    });
  } catch (error: any) {
    return {
      message: error.message || "Terjadi kesalahan saat membuat pengguna",
    };
  }
}

export async function updateUser(
  state: UpdateUserFormState,
  formData: FormData
) {
  try {
    const validatedFields = UpdateUserSchema.safeParse({
      id: formData.get("id"),
      email: formData.get("email"),
      username: formData.get("username"),
      gender: formData.get("gender"),
      date_of_birth: formData.get("date_of_birth"),
      address: formData.get("address"),
      user_type: formData.get("user_type"),
      thumbnail: formData.get("thumbnail"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const updatedData: any = {
      email: formData.get("email"),
      username: formData.get("username"),
      gender: formData.get("gender"),
      date_of_birth: new Date(formData.get("date_of_birth") as string),
      address: formData.get("address"),
      user_type: formData.get("user_type"),
      is_active: true,
      is_verified: true,
    };

    const oldThumbnail = await prisma.user.findUnique({
      where: { id: parseInt(formData.get("id") as string) },
      select: { thumbnail: true },
    });

    const thumbnail = formData.get("thumbnail") as File;
    if (thumbnail) {
      const fileObject = {
        buffer: Buffer.from(await thumbnail.arrayBuffer()),
        originalname: thumbnail.name,
        mimetype: thumbnail.type,
      };
      await deleteFile(oldThumbnail?.thumbnail as string);
      const thumbnailUrl = await uploadFile(fileObject);
      updatedData.thumbnail = thumbnailUrl;
    }

    await prisma.user.update({
      where: { id: parseInt(formData.get("id") as string) },
      data: updatedData,
    });

  } catch (error: any) {
    return {
      message: error.message || "Terjadi kesalahan saat memperbarui pengguna",
    };
  }
}


export async function getUser(id: number) {
  return await prisma.user.findUnique({ where: { id } });
}
