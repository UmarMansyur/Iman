/* eslint-disable @typescript-eslint/no-unused-vars */
// import { Prisma, PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import prisma from "@/lib/db";
import * as bcrypt from "bcrypt";

async function main(): Promise<void> {
  const admin = await prisma.user.create({
    data: {
      email: "admin@iman.com",
      username: "Administrator",
      password: await bcrypt.hash("admin123.", 10),
      date_of_birth: new Date("2001-07-29"),
      gender: "Male",
      user_type: "Administrator",
      address: "Jl. Admin",
      is_active: true,
      is_verified: true,
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: "operator@iman.com",
      username: "Operator",
      password: await bcrypt.hash("Operator123.", 10),
      date_of_birth: new Date("2001-07-29"),
      gender: "Male",
      address: "Jl. Operator",
      user_type: "Operator",
      is_active: true,
      is_verified: true,
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@iman.com",
      username: "owner",
      password: await bcrypt.hash("Owner123.", 10),
      date_of_birth: new Date("2001-07-29"),
      gender: "Male",
      address: "Jl. Owner",
      user_type: "Operator",
      is_active: true,
      is_verified: true,
    },
  });

  const distributor = await prisma.user.create({
    data: {
      email: "distributor@iman.com",
      username: "distributor",
      password: await bcrypt.hash("distributor", 10),
      date_of_birth: new Date("2001-07-29"),
      gender: "Male",
      address: "Jl. Distributor",
      user_type: "Operator",
      is_active: true,
      is_verified: true,
    },
  });

  const distributor2 = await prisma.user.create({
    data: {
      email: "inderadistribution@iman.com",
      username: "Indera Distribution",
      password: await bcrypt.hash("distributor123.", 10),
      date_of_birth: new Date("2001-07-29"),
      gender: "Male",
      address: "Jl. Indera Distribution",
      user_type: "Operator",
      is_active: true,
      is_verified: true,
    },
  });

  const citra = await prisma.user.create({
    data: {
      email: "citra@iman.com",
      username: "citra",
      password: await bcrypt.hash("citra", 10),
      date_of_birth: new Date("2001-07-29"),
      gender: "Female",
      address: "Jl. Citra",
      user_type: "Operator",
      is_active: true,
      is_verified: true,
    },
  });

  const lita = await prisma.user.create({
    data: {
      email: "lita@iman.com",
      username: "lita",
      password: await bcrypt.hash("lita", 10),
      date_of_birth: new Date("2001-07-29"),
      gender: "Female",
      address: "Jl. Lita",
      user_type: "Operator",
      is_active: true,
      is_verified: true,
    },
  });

  const yanti = await prisma.user.create({
    data: {
      email: "yanti@iman.com",
      username: "yanti",
      password: await bcrypt.hash("yanti", 10),
      date_of_birth: new Date("2001-07-29"),
      gender: "Female",
      address: "Jl. Yanti",
      user_type: "Operator",
      is_active: true,
      is_verified: true,
    },
  });

  const prsj = await prisma.factory.create({
    data: {
      nickname: "PRSJ",
      user_id: admin.id,
      name: "PR. Safira Jaya",
      address: "Jl. Raya Trasak Pamekasan",
      status: "Active",
    },
  });

  const prpj = await prisma.factory.create({
    data: {
      nickname: "PRPJ",
      user_id: distributor2.id,
      name: "PR. Pelita Jaya",
      address: "Blungbungan",
      status: "Active",
    },
  });

  await prisma.role.createMany({
    data: [
      { role: "Owner" },
      { role: "Operator" },
      { role: "Distributor" },
      { role: "Owner Distributor" },
    ],
  });

  const ownerDistributor = await prisma.user.create({
    data: {
      email: "ownerdistributor@iman.com",
      username: "ownerdistributor",
      password: await bcrypt.hash("ownerdistributor", 10),
      date_of_birth: new Date("2001-07-29"),
      gender: "Male",
      address: "Jl. Owner Distributor",
      user_type: "Operator",
      is_active: true,
      is_verified: true,
    },
  });

  await prisma.memberFactory.createMany({
    data: [
      {
        factory_id: prpj.id,
        user_id: ownerDistributor.id,
        role_id: 4,
        status: "Active",
      },
      {
        factory_id: prsj.id,
        user_id: ownerDistributor.id,
        role_id: 4,
        status: "Active",
      },
      {
        factory_id: prpj.id,
        user_id: distributor.id,
        role_id: 3,
        status: "Active",
      },
      {
        factory_id: prsj.id,
        user_id: distributor.id,
        role_id: 3,
        status: "Active",
      },
      {
        factory_id: prpj.id,
        user_id: distributor2.id,
        role_id: 3,
        status: "Active",
      },
      {
        factory_id: prsj.id,
        user_id: distributor2.id,
        role_id: 3,
        status: "Active",
      },
      {
        factory_id: prsj.id,
        user_id: citra.id,
        role_id: 2,
        status: "Active",
      },
      {
        factory_id: prpj.id,
        user_id: yanti.id,
        role_id: 2,
        status: "Active",
      },
      {
        factory_id: prsj.id,
        user_id: lita.id,
        role_id: 2,
        status: "Active",
      },
      {
        factory_id: prpj.id,
        user_id: operator.id,
        role_id: 2,
        status: "Active",
      },
      {
        factory_id: prsj.id,
        user_id: operator.id,
        role_id: 2,
        status: "Active",
      },
      {
        factory_id: prsj.id,
        user_id: owner.id,
        role_id: 1,
        status: "Active",
      },
      {
        factory_id: prpj.id,
        user_id: owner.id,
        role_id: 1,
        status: "Active",
      },
    ],
  });

  await prisma.factoryDistributor.create({
    data: {
      factoryId: prsj.id,
      name: "Indera Distribution",
      MemberDistributor: {
        createMany: {
          data: [
            {
              user_id: distributor2.id,
            },
            {
              user_id: distributor.id,
            },
            {
              user_id: ownerDistributor.id,
            },
          ],
        },
      },
    },
  });

  await prisma.factoryDistributor.create({
    data: {
      factoryId: prpj.id,
      name: "Indera Distribution",
      MemberDistributor: {
        createMany: {
          data: [
            { user_id: distributor2.id },
            { user_id: distributor.id },
            { user_id: ownerDistributor.id },
          ],
        },
      },
    },
  });

  await prisma.bankAccount.createMany({
    data: [
      {
        factory_id: prsj.id,
        name: "Bank prsj",
        rekening: "1234567890",
        bank_name: "Bank Negara Indonesia",
      },
    ],
  });

  await prisma.paymentMethod.createMany({
    data: [
      { name: "Kredit/BOND" },
      { name: "Pembayaran 100%" },
      { name: "Pembayaran 50%" },
      { name: "Konsinasi" },
      { name: "Cash" },
    ],
  });

  await prisma.material.createMany({
    data: [
      { name: "E-Tiket Lucca Blueberry", factory_id: prsj.id },
      { name: "E-Tiket Lucca SPM", factory_id: prsj.id },
      { name: "Filter Reg", factory_id: prsj.id },
      { name: "E-Tiket ESTE REG", factory_id: prsj.id },
      { name: "E-Tiket Pharlap SPM", factory_id: prsj.id },
      { name: "E-Tiket Lucca Blueberry", factory_id: prsj.id },
      { name: "E-Tiket ST Legend", factory_id: prsj.id },
      { name: "CTP LUCCA", factory_id: prsj.id },
      { name: "TSG", factory_id: prpj.id },
      { name: "Filter", factory_id: prpj.id },
      { name: "Bobin", factory_id: prpj.id },
      { name: "Etiket", factory_id: prpj.id },
      { name: "Foil Gold", factory_id: prpj.id },
      { name: "Foil Silver", factory_id: prpj.id },
      { name: "Inner", factory_id: prpj.id },
      { name: "CPT", factory_id: prpj.id },
      { name: "Lem CTP", factory_id: prpj.id },
      { name: "Lem AMBRI", factory_id: prpj.id },
      { name: "Pita SKM", factory_id: prpj.id },
      { name: "Pita SPM", factory_id: prpj.id },
      { name: "Pita SKT", factory_id: prpj.id },
    ],
  });

  await prisma.unit.createMany({
    data: [
      { name: "Kg" }, // id 1
      { name: "Try" }, // id 2
      { name: "Meter" }, // id 3
      { name: "Box" }, // id 4
      { name: "Pack" }, // id 5
      { name: "Roll" }, // id 6
      { name: "Kardus" }, // id 7
      { name: "Lusin" }, // id 8
      { name: "Karton" }, // id 9
      { name: "Rolls" }, // id 10
      { name: "Keping" }, // id 11
      { name: "Pcs" }, // id 12
      { name: "Press" }, // id 13
      { name: "Bal" }, // id 14
    ],
  });

  await prisma.materialUnit.createMany({
    data: [
      { material_id: 1, unit_id: 1 },
      { material_id: 2, unit_id: 2 },
      { material_id: 3, unit_id: 6 },
      { material_id: 4, unit_id: 12 },
      { material_id: 5, unit_id: 6 },
      { material_id: 6, unit_id: 6 },
      { material_id: 7, unit_id: 6 },
      { material_id: 8, unit_id: 1 },
      { material_id: 9, unit_id: 1 },
      { material_id: 10, unit_id: 3 },
    ],
  });

  await prisma.product.createMany({
    data: [
      {
        factory_id: prsj.id,
        name: "ST Premium",
        type: "SKT",
        price: 13000,
      },
      {
        factory_id: prsj.id,
        name: "ST Legend",
        type: "SKT",
        price: 14000,
      },
      {
        factory_id: prsj.id,
        name: "Lucca Click",
        type: "SKT",
        price: 10000,
      },
      {
        factory_id: prsj.id,
        name: "Pharlap SPM",
        type: "SKT",
        price: 10000,
      },
    ],
  });

  const ppns = await prisma.pPN.create({
    data: {
      desc: "PPN 12%",
      percentage: 12,
    },
  });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
