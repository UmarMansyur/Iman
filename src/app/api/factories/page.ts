/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const factories = await prisma.factory.findMany();
  return NextResponse.json(factories);
}