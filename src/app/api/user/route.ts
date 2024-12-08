/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { Gender, PrismaClient, UserType } from "@prisma/client";
import bcrypt from "bcrypt";
import { uploadFile } from "@/lib/imagekit";

const prisma = new PrismaClient();

// GET all users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Get single user
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          email: true,
          username: true,
          gender: true,
          date_of_birth: true,
          address: true,
          user_type: true,
          is_active: true,
          is_verified: true,
        },
      });
      return NextResponse.json({ user }, { status: 200 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        gender: true,
        date_of_birth: true,
        thumbnail: true,
        address: true,
        user_type: true,
        is_active: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
      },
    });
    const total = await prisma.user.count();
    const active = await prisma.user.count({
      where: {
        is_active: true,
      },
    });
    const verified = await prisma.user.count({
      where: {
        is_verified: true,
      },
    });

    return NextResponse.json({ users, total, active, verified }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new user
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const thumbnail = formData.get('thumbnail') as File;
    
    let thumbnailUrl = null;
    if (thumbnail) {

      const fileObject = {
        buffer: Buffer.from(await thumbnail.arrayBuffer()),
        originalname: thumbnail.name,
        mimetype: thumbnail.type
      };
      thumbnailUrl = await uploadFile(fileObject);
    }

    const hashedPassword = await bcrypt.hash(formData.get('password') as string, 10);

    const user = await prisma.user.create({
      data: {
        email: formData.get('email') as string,
        username: formData.get('username') as string,
        password: hashedPassword,
        gender: formData.get('gender') as Gender,
        date_of_birth: new Date(formData.get('date_of_birth') as string),
        thumbnail: thumbnailUrl,
        address: formData.get('address') as string,
        user_type: (formData.get('user_type') as UserType) || "Operator",
        is_active: true,
        is_verified: true,
      },
    });

    const result = { ...user, password: undefined };
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT update user
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const updateData: any = {
      email: formData.get('email'),
      username: formData.get('username'),
      gender: formData.get('gender'),
      date_of_birth: new Date(formData.get('date_of_birth') as string),
      address: formData.get('address'),
      user_type: formData.get('user_type'),
      is_active: true,
      is_verified: true,
    };

    // Handle thumbnail if exists
    const thumbnail = formData.get('thumbnail');
    if (thumbnail instanceof Blob) {
      const fileObject = {
        buffer: Buffer.from(await thumbnail.arrayBuffer()),
        originalname: thumbnail.name,
        mimetype: thumbnail.type
      };
      const thumbnailUrl = await uploadFile(fileObject);
      updateData.thumbnail = thumbnailUrl;
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id as string) },
      data: updateData,
    });

    const result = { ...user, password: undefined };
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
} 