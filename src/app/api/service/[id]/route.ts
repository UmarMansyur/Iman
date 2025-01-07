/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: any}) {
  const paramId = await params;
  const id = paramId.id;
  try {
    const service = await prisma.service.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    
    if(!service) {
      return NextResponse.json({error: "Layanan jasa tidak ditemukan!"}, {status: 404})
    }
    
    return NextResponse.json({data: service}, {status: 200})
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: any}) {
  const paramId = await params;
  const id = paramId.id;

  const { name, price } = await request.json();

  try {
    const service = await prisma.service.findFirst({
      where: {
        id: parseInt(id)
      }
    })

    if(!service) {
      return NextResponse.json({error: "Layanan jasa tidak ditemukan!"}, {status: 404})
    }

    const updatedLocation = await prisma.service.update({
      where: {id: parseInt(id)},
      data: {name, price}
    });

    return NextResponse.json({message: "Layanan jasa berhasil diubah!", data: updatedLocation}, {status: 200})
  } catch (error: any) {
    return NextResponse.json({error: error.message}, {status: 500})
  }

}

export async function DELETE(request: Request, { params }: { params: any}) {
  const paramId = await params;
  const id = paramId.id;
  try {

    const existingLocation = await prisma.service.findUnique({
      where: {
        id: parseInt(id)
      }
    })

    if(!existingLocation) {
      return NextResponse.json({error: "Layanan jasa tidak ditemukan!"}, {status: 404})
    }

    const service = await prisma.service.delete({
      where: {
        id: parseInt(id)
      }
    })
    return NextResponse.json({message: "Layanan jasa berhasil dihapus!", data: service}, {status: 200})
  } catch (error: any) {
    return NextResponse.json({error: error.message}, {status: 500})
  }
}
