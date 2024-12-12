/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/db";
import { verifyToken } from "@/lib/session";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return Response.json({ error: "Token is required" }, { status: 400 });
    }

    // Verifikasi token
    const payload = await verifyToken(token);
    if (!payload || !payload.payload.id || !payload.payload.email) {
      return Response.json({ error: "Invalid token" }, { status: 400 });
    }

    // Cek apakah token sudah expired
    if (payload.payload.expired < new Date().getTime()) {
      return Response.json({ error: "Token has expired" }, { status: 400 });
    }

    // Update status undangan di database
    const updatedInvitation = await prisma.memberFactory.update({
      where: {
        id: parseInt(payload.payload.id),
      },
      data: {
        status: "Active",
      }
    });

    if (!updatedInvitation) {
      return Response.json({ error: "Invitation not found or already activated" }, { status: 400 });
    }

    return Response.redirect(new URL("/", req.url));
    return Response.json({ message: "Invitation activated successfully" }, { status: 200 });

  } catch (error:any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 