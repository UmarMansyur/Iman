/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: any}) {
  const paramId = await params;
  const id = paramId.id;
  try {
    const location = await prisma.location.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if(!location) {
      return NextResponse.json({error: "Lokasi tidak ditemukan!"}, {status: 404})
    }
    
    return NextResponse.json({data: location}, {status: 200})
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: any}) {
  const paramId = await params;
  const id = paramId.id;

  const { name, cost } = await request.json();

  try {
    const location = await prisma.location.findFirst({
      where: {
        id: parseInt(id)
      }
    })

    if(!location) {
      return NextResponse.json({error: "Lokasi tidak ditemukan!"}, {status: 404})
    }

    const updatedLocation = await prisma.location.update({
      where: {id: parseInt(id)},
      data: {name, cost}
    });

    return NextResponse.json({message: "Lokasi berhasil diubah!", data: updatedLocation}, {status: 200})
  } catch (error: any) {
    return NextResponse.json({error: error.message}, {status: 500})
  }

}

export async function DELETE(request: Request, { params }: { params: any}) {
  const paramId = await params;
  const id = paramId.id;
  try {

    const existingLocation = await prisma.location.findUnique({
      where: {
        id: parseInt(id)
      }
    })

    if(!existingLocation) {
      return NextResponse.json({error: "Lokasi tidak ditemukan!"}, {status: 404})
    }

    const location = await prisma.location.delete({
      where: {
        id: parseInt(id)
      }
    })
    return NextResponse.json({message: "Lokasi berhasil dihapus!", data: location}, {status: 200})
  } catch (error: any) {
    return NextResponse.json({error: error.message}, {status: 500})
  }
}
