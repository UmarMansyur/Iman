/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";

export async function POST(request: Request) {
  const { material_id, unit_id, factory_id } = await request.json();
  const existingMaterial: any = await prisma.material.findFirst({
    where: {
      name: material_id,
    },
  });
  if (!existingMaterial) {
    const material = await prisma.material.create({
      data: {
        name: material_id,
        factory_id: parseInt(factory_id),
      },
    });
    existingMaterial.id = material.id;
  }
  await prisma.materialUnit.create({
    data: {
      material_id: existingMaterial.id,
      unit_id: parseInt(unit_id),
    },
  });
}
