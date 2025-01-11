/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/imagekit";
import bcrypt from "bcrypt";
import { Gender } from "@prisma/client";
export async function GET(request: Request, { params }: { params: any }) {
  const paramsId = await params;
  const id = paramsId.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if(!user) {
      throw new Error("User not found");
    }

    const result = { ...user, password: undefined };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: any }) {
  const paramsId = await params;
  const id = paramsId.id;
  const formData = await request.formData();
  const username = formData.get('username') as string || "";
  const email = formData.get('email') as string || "";
  const password = formData.get('password') as string || "";
  const gender = formData.get('gender') as string || "";
  const date_of_birth = formData.get('date_of_birth') as string || "";
  const address = formData.get('address') as string || "";
  const thumbnail = formData.get('thumbnail') as File || null;

  let thumbnailUrl = null;

  if(thumbnail) {
    const fileObject = {
      buffer: Buffer.from(await thumbnail.arrayBuffer()),
      originalname: thumbnail.name,
      mimetype: thumbnail.type
    }
    thumbnailUrl = await uploadFile(fileObject);
  }

  let hashedPassword = '';

  if(password !== "") {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  try {

    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if(!user) {
      throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { username, email, password: hashedPassword, gender: gender as Gender, date_of_birth, address, thumbnail: thumbnailUrl }
    });

    const result = { ...updatedUser, password: undefined };
    return NextResponse.json({
      message: "User berhasil diubah",
      data: result
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: any }) {
  const paramsId = await params;
  const id = paramsId.id;
  const formData = await request.json();
  // {
  //   "oldPassword": "admin",
  //   "newPassword": "adminlagi",
  //   "confirmPassword": "adminlagi"
  // }
  const { oldPassword, newPassword, confirmPassword } = formData;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if(!user) {
      throw new Error("User not found");
    }

    let hashedPassword = user.password;

    if(newPassword !== "") {
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    if(confirmPassword !== newPassword) {
      throw new Error("Konfirmasi password tidak cocok");
    }

    if(oldPassword !== "") {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if(!isMatch) {
        throw new Error("Password lama tidak cocok");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { password: hashedPassword }
    });

    const result = { ...updatedUser, password: undefined };
    return NextResponse.json({
      message: "Password berhasil diubah",
      data: result
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
