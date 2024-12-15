/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import * as bcrypt from "bcrypt";

async function main(): Promise<void> {
  const admin = await prisma.user.create({
    data: {
      email: "admin@iman.com",
      username: "admin",
      password: await bcrypt.hash("admin", 10),
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
      username: "operator",
      password: await bcrypt.hash("operator", 10),
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
      password: await bcrypt.hash("owner", 10),
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

  const djava = await prisma.factory.create({
    data: {
      nickname: "SJ",
      user_id: admin.id,
      name: "Safira Jaya",
      address: "Jl. Safira Jaya",
      status: "Active",
    },
  });

  await prisma.factory.create({
    data: {
      nickname: "PLT",
      user_id: admin.id,
      name: "Pelita",
      address: "Jl. Pelita",
      status: "Active",
    },
  });

  await prisma.role.createMany({
    data: [
      { role: "Owner" },
      { role: "Operator" },
      { role: "Distributor" },
      { role: "Sales" },
    ],
  });

  await prisma.memberFactory.createMany({
    data: [
      {
        factory_id: djava.id,
        user_id: operator.id,
        role_id: 2,
        status: "Active"
      },
      {
        factory_id: djava.id,
        user_id: distributor.id,
        role_id: 3,
        status: "Active"
      },
      {
        factory_id: djava.id,
        user_id: owner.id,
        role_id: 1,
        status: "Active"
      },
    ],
  });

  await prisma.bankAccount.createMany({
    data: [
      {
        factory_id: djava.id,
        name: "Bank Djava",
        rekening: "1234567890",
        bank_name: "Bank Negara Indonesia",
      },
    ],
  });

  await prisma.paymentMethod.createMany({
    data: [
      { name: "Kredit" },
      { name: "BOND" },
      { name: "Cash" },
    ],
  });

  await prisma.material.createMany({
    data: [
      { name: "TSG" },
      { name: "Filter" },
      { name: "Bobin" },
      { name: "Etiket" },
      { name: "Foil Gold" },
      { name: "Foil Silver" },
      { name: "Inner" },
      { name: "CPT" },
      { name: "Lem CTP" },
      { name: "Lem AMBRI" },
      { name: "Pita SKM" },
      { name: "Pita SPM" },
      { name: "Pita SKT" },
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
        factory_id: djava.id,
        name: "ST Premium",
        type: "Kretek",
        price: 13000,
      },
      {
        factory_id: djava.id,
        name: "ST Legend",
        type: "Kretek",
        price: 14000,
      },
      {
        factory_id: djava.id,
        name: "Lucca Click",
        type: "Kretek",
        price: 10000,
      },
      {
        factory_id: djava.id,
        name: "Pharlap SPM",
        type: "Kretek",
        price: 10000,
      },
    ],
  });

  await prisma.reportProduct.create({
    data: {
      product_id: 1,
      amount: 100,
      factory_id: djava.id,
      morning_shift_amount: 10,
      morning_shift_time: new Date("2024-01-01 08:00:00"),
      morning_shift_user_id: operator.id,
      afternoon_shift_amount: 10,
      afternoon_shift_time: new Date("2024-01-01 15:00:00"),
      afternoon_shift_user_id: operator.id,
    },
  });

  await prisma.reportCost.create({
    data: {
      material_id: 1,
      amount: 100,
      factory_id: djava.id,
      unit_id: 1,
      user_id: operator.id,
    },
  });

  const ppns: Prisma.PPNCreateInput = await prisma.pPN.create({
    data: {
      desc: "PPN 12%",
      percentage: 12,
    },
  });

  const buyer = await prisma.buyer.create({
    data: {
      name: "PT. Iman",
      address: "Jl. Iman",
      factory_id: djava.id,
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      factory_id: djava.id,
      user_id: admin.id,
      is_distributor: true,
      invoice_code: "INV-001",
      buyer_id: buyer.id,
      maturity_date: new Date("2024-01-01"),
      item_amount: 1,
      down_payment: 100000,
      ppn: ppns.percentage,
      payment_method_id: 1,
      total: 1000000,
      sub_total: 1000000,
      remaining_balance: 1000000,
      payment_status: "Pending",
    },
  });

  await prisma.detailInvoice.create({
    data: {
      product_id: 1,
      invoice_id: invoice.id,
      desc: "ST Premium",
      amount: 1,
      sub_total: 1000000,
      is_product: true,
    },
  });

  const location = await prisma.location.create({
    data: {
      factory_id: djava.id,
      name: "Jl. Delivery",
      cost: 100000,
    }
  })

  await prisma.deliveryTracking.create({
    data: {
      invoice_id: invoice.id,
      desc: "Delivery",
      location_id: location.id,
      latitude: -6.2088,
      longitude: 106.8456,
      cost: 100000,
      sales_man: "John Doe",
      recipient: "PT. Iman",
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
