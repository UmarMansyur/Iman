/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import UpdateHarga from "@/components/email/update-harga";
import prisma from "@/lib/db";
import { ProductFormState, ProductSchema } from "@/lib/definitions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function createProduct(
  state: ProductFormState,
  formData: FormData
) {
  const validatedFields = ProductSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    type: formData.get("type"),
    factory_id: formData.get("factory_id"),
    price: formData.get("price"),
    per_slop: formData.get("per_slop"),
    per_bal: formData.get("per_bal"),
    per_karton: formData.get("per_karton"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, type, factory_id, price, per_slop, per_bal, per_karton } = validatedFields.data

  try {
    if (id) {
      const existData = await prisma.product.findFirst({
        where: { id: Number(id) },
        include: {
          factory: true,
        },
      });

      if (!existData) {
        throw new Error("Produk tidak ditemukan");
      }

      const exist = await prisma.product.findFirst({
        where: {
          name: name,
          factory_id: Number(factory_id),
          type: type,
          id: { not: Number(id) },
        },
      });

      if (exist) {
        throw new Error("Produk sudah ada");
      }

      await prisma.product.update({
        where: { id: Number(id) },
        data: { name, type, price: Number(price), per_slop: Number(per_slop), per_bal: Number(per_bal), per_karton: Number(per_karton) },
      });

      await prisma.memberPriceProduct.updateMany({
        where: { product_id: Number(id) },
        data: { price: Number(price) },
      });

      // ambil semua data distributor
      const distributors = await prisma.factoryDistributor.findMany({
        where: { factoryId: Number(factory_id) },
        include: {
          MemberDistributor: {
            include: {
              User: true,
            }
          },
        },
      });

      const listUser = distributors.map((distributor) =>
        distributor.MemberDistributor.map((member) => member.User.email)
      );

      const listEmail = listUser.flat();

      if (existData?.price !== Number(price)) {
        // kirim semua notifikasi ke user
        for (const email of listEmail) {
          const { error } = await resend.emails.send({
            from: "no-reply@inderadistribution.com",
            to: [email],
            subject: "Informasi Perubahan Harga Produk",
            react: UpdateHarga({
              productName: existData?.name + " - " + existData?.type || "",
              factoryName: existData?.factory?.name || "",
              newPrice: Number(price),
              oldPrice: existData?.price || 0,
            }),
          });
          if (error) {
            console.log(error);
          }
        }
      }
    } else {
      const exist = await prisma.product.findFirst({
        where: { name: name, factory_id: Number(factory_id), type: type },
      });
      if (exist) {
        throw new Error("Produk sudah ada");
      }
      await prisma.product.create({
        data: {
          name,
          type,
          factory_id: Number(factory_id),
          price: Number(price),
          per_slop: Number(per_slop ? per_slop : 10),
          per_bal: Number(per_bal ? per_bal : 200),
          per_karton: Number(per_karton ? per_karton : 800),
        },
      });
    }
    return {
      message: "Produk berhasil dibuat",
    };
  } catch (error: any) {
    return {
      message: error.message || "Gagal membuat produk",
    };
  }
}
