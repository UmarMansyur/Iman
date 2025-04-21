/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth";
import { cookies } from "next/headers";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const response = await verifyCredentials(email, password);
    if (!response) {
      throw new Error("Invalid credentials.");
    }

    const session = await createSession(response);
    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: body,
      session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const cookiesStore = await cookies();
  cookiesStore.delete("session");
  return NextResponse.json({
    success: true,
    message: "Logout successful",
  });
}
