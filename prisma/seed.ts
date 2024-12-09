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

  const djava = await prisma.factory.create({
    data: {
      nickname: "Djava",
      user_id: admin.id,
      name: "Djava",
      address: "Jl. Djava",
      status: "Active",
    },
  });

  await prisma.role.createMany({
    data: [
      { role: "Owner" },
      { role: "Operator" },
      { role: "Member" },
      { role: "Downline" },
    ],
  });

  const djavaMember = await prisma.memberFactory.createMany({
    data: [
      {
        factory_id: djava.id,
        user_id: admin.id,
        role_id: 1,
      },
      {
        factory_id: djava.id,
        user_id: operator.id,
        role_id: 2,
      },
    ],
  });

  const bankDjava = await prisma.bankAccount.createMany({
    data: [
      {
        factory_id: djava.id,
        name: "Bank Djava",
        rekening: "1234567890",
        bank_name: "Bank Negara Indonesia",
      },
    ],
  });

  const paymentMethod = await prisma.paymentMethod.createMany({
    data: [
      { name: "Transfer" },
      { name: "Cash" },
      { name: "Virtual Account" },
      { name: "QRIS" },
      { name: "BOND" },
      { name: "KREDIT" },
      // jatuh tempo 1 bulan di email
      // belum  lunas tagihan di distributor yang belum selesai
    ],
  });

  const materials = await prisma.material.createMany({
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

  const unit = await prisma.unit.createMany({
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
      { name: "Ball" }, // id 14
    ],
  });

  const product = await prisma.product.createMany({
    data: [
      {
        factory_id: djava.id,
        name: "ST Premium",
        type: "Kretek",
      },
      {
        factory_id: djava.id,
        name: "ST Gold",
        type: "Kretek",
      },
      {
        factory_id: djava.id,
        name: "ST Silver",
        type: "Kretek",
      },
    ],
  });

  const kartonProdukUnit = await prisma.productUnit.create({
    // 1 press = 10 pack
    // 1 ball 20 stop/press
    // 1 karton 4 ball
    data: {
      product_id: 1,
      unit_id: 9,
      amount: 1,
    },
  });

  const ballProductUnit = await prisma.productUnit.create({
    data: {
      product_id: 1,
      unit_id: 14,
      amount: 1,
      convert_from_parent: 4,
      parent_id: kartonProdukUnit.id,
    },
  });

  const pressProductUnit = await prisma.productUnit.create({
    data: {
      product_id: 1,
      unit_id: 5,
      amount: 1,
      convert_from_parent: 10,
      parent_id: ballProductUnit.id,
    },
  });

  await prisma.priceProductUnit.create({
    data: {
      product_unit_id: ballProductUnit.id,
      price: 1000,
      sale_price: 1000,
      status: "Active",
    },
  });

  await prisma.priceProductUnit.create({
    data: {
      product_unit_id: pressProductUnit.id,
      price: 1000,
      sale_price: 1000,
      status: "Active",
    },
  });

  await prisma.priceProductUnit.create({
    data: {
      product_unit_id: kartonProdukUnit.id,
      price: 1000,
      sale_price: 1000,
      status: "Active",
    },
  });

  await prisma.stockProduct.create({
    data: {
      product_unit_id: ballProductUnit.id,
      amount: 100,
    },
  });

  await prisma.reportProduct.create({
    data: {
      product_id: 1,
      amount: 100,
      user_id: operator.id,
      factory_id: djava.id,
      unit_id: 14,
      morning_shift_amount: 10,
      afternoon_shift_amount: 10,
      morning_shift_time: new Date("2024-01-01 08:00:00"),
      afternoon_shift_time: new Date("2024-01-01 15:00:00"),
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

  const invoice = await prisma.invoice.create({
    data: {
      factory_id: djava.id,
      user_id: admin.id,
      invoice_code: "INV-001",
      amount: 1000000,
      buyer: "PT. Iman",
      sales_man: "John Doe",
      recipient: "PT. Iman",
      maturity_date: new Date("2024-01-01"),
      item_amount: 1,
      buyer_address: "Jl. Iman",
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
      invoice_id: invoice.id,
      unit_id: 1,
      desc: "ST Premium",
      amount: 1,
      sub_total: 1000000,
    },
  });

  await prisma.deliveryTracking.create({
    data: {
      invoice_id: invoice.id,
      desc: "Delivery",
      location: "Jl. Delivery",
      latitude: -6.2088,
      longitude: 106.8456,
      cost: 100000,
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
