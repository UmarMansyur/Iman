'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { FactoryFormState } from "@/lib/definitions";
import { FactorySchema } from "@/lib/definitions";
import { deleteFile, uploadFile } from "@/lib/imagekit";

export const createFactory = async (state: FactoryFormState, formData: FormData) => {
  const validatedFields = FactorySchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname"),
    user_id: formData.get("user_id"),
    address: formData.get("address"),
    logo: formData.get("logo"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { name, nickname, user_id, address } = validatedFields.data;


  try {
    const logo = formData.get("logo") as File;
    let logoUrl = null;
    if (logo && logo.size > 0) {
      const fileObject = {
        buffer: Buffer.from(await logo.arrayBuffer()),
        originalname: logo.name,
        mimetype: logo.type,
      };
      logoUrl = await uploadFile(fileObject);
    }
  
    const existingFactory = await prisma.factory.findFirst({
      where: {
        name
      }
    });
  
    if (existingFactory) {
      return {
        errors: {
          name: ["Nama pabrik sudah ada"]
        }
      }
    }
  
    await prisma.factory.create({
      data: {
        name,
        nickname,
        user_id: parseInt(user_id as string),
        logo: logoUrl || null,
        address,
        status: "Active",
        memberFactories: {
          create: {
            user_id: parseInt(user_id as string),
            role_id: 1,
            status: 'Active'
          }
        }
      }
    });

    return {
      message: "Pabrik berhasil dibuat!"
    }
    
  } catch (error: any) {
    console.log(error.message);
    return {
      message: error.message || "Gagal membuat pabrik"
    }
  }
}


export const updateFactory = async (state: FactoryFormState, formData: FormData) => {
  const validatedFields = FactorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    nickname: formData.get("nickname"),
    user_id: formData.get("user_id"),
    address: formData.get("address"),
    status: formData.get("status"),
    logo: formData.get("logo")
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { id, name, nickname, user_id, address, status } = validatedFields.data;

  try {
    const logo = formData.get("logo") as File;
    const exist = await prisma.factory.findFirst({
      where: {
        id: parseInt(id as string)
      }
    });
    let logoUrl = exist?.logo || null;
    
    if (logo && logo.size > 0) {
      const fileObject = {
        buffer: Buffer.from(await logo.arrayBuffer()),
        originalname: logo.name,
        mimetype: logo.type,
        folder: "factory",
        fileName: `factory-${id}-${Date.now()}`
      };
      
      if (exist?.logo) {
        await deleteFile(exist.logo);
      }
      logoUrl = await uploadFile(fileObject);
    }

    if(!exist) {
      return {
        message: "Pabrik tidak ditemukan"
      }
    }
  
    const existingFactory = await prisma.factory.findFirst({
      where: {
        name,
        id: {
          not: parseInt(id as string)
        }
      }
    });
  
    if (existingFactory) {
      return {
        errors: {
          name: ["Nama pabrik sudah ada"]
        }
      }
    }

    await prisma.memberFactory.deleteMany({
      where: {
        user_id: parseInt(user_id as string),
        factory_id: parseInt(id as string)
      }
    })
  
    await prisma.factory.update({
      where: {
        id: parseInt(id as string)
      },
      data: {
        name,
        nickname,
        user_id: parseInt(user_id as string),
        logo: logoUrl,
        address,
        status,
        memberFactories: {
          create: {
            user_id: parseInt(user_id as string),
            role_id: 1
          }
        }
      }
    })
    
  } catch (error: any) {
    return {
      message: error.message || "Gagal membuat pabrik",
    }
  }
}


