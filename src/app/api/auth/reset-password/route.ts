/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/session";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { token, password, confirmPassword } = await req.json();
  try {
    // check apakah sudah expired atau belum dari jwt
    const decoded = await verifyToken(token);
    if (decoded.exp < Date.now() / 1000) {
      return NextResponse.json({ error: "Token sudah expired" }, { status: 400 });
    }
  
    // check apakah user ada atau tidak
    const user = await prisma.user.findFirst({
      where: {
        email: decoded.email,
      },
    });

    if(!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 400 });
    }

    if(password !== confirmPassword) {
      return NextResponse.json({ error: "Password dan konfirmasi password tidak cocok" }, { status: 400 });
    }

    const newPassword = await bcrypt.hash(password, 10);

    // update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });

    return NextResponse.json({ message: "Password berhasil diubah" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }


}
