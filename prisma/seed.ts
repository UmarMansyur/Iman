/* eslint-disable @typescript-eslint/no-unused-vars */
// import { Prisma, PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import prisma from "@/lib/db";
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

  const ditributor2 = await prisma.user.create({
    data: {
      email: "inderadistribution@iman.com",
      username: "inderadistribution",
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
      user_id: ditributor2.id,
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
      { role: "Agent" },
    ],
  });

  await prisma.memberFactory.createMany({
    data: [
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
        user_id: ditributor2.id,
        role_id: 3,
        status: "Active",
      },
      {
        factory_id: prsj.id,
        user_id: ditributor2.id,
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
              user_id: ditributor2.id,
            },
            {
              user_id: distributor.id,
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
          data: [{ user_id: ditributor2.id }, { user_id: distributor.id }],
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
        type: "Kretek",
        price: 13000,
      },
      {
        factory_id: prsj.id,
        name: "ST Legend",
        type: "Kretek",
        price: 14000,
      },
      {
        factory_id: prsj.id,
        name: "Lucca Click",
        type: "Kretek",
        price: 10000,
      },
      {
        factory_id: prsj.id,
        name: "Pharlap SPM",
        type: "Kretek",
        price: 10000,
      },
    ],
  });

  for (let i = 1; i <= 1000; i++) {
    // random quantity tidak boleh ganjil
    let randomQuantity = Math.floor(Math.random() * 100) + 1;
    if (randomQuantity % 2 !== 0) {
      randomQuantity++;
    }
    await prisma.reportProduct.create({
      data: {
        product_id: 1,
        amount: randomQuantity,
        factory_id: Math.floor(Math.random() * 2) + 1,
        morning_shift_amount: randomQuantity / 2,
        morning_shift_time: new Date(
          Math.floor(
            Math.random() * (Date.now() - new Date(2025, 0, 1).getTime())
          ) + new Date(2025, 0, 1).getTime()
        ),
        morning_shift_user_id: operator.id,
        afternoon_shift_amount: randomQuantity / 2,
        afternoon_shift_time: new Date(
          Math.floor(
            Math.random() * (Date.now() - new Date(2025, 0, 1).getTime())
          ) + new Date(2025, 0, 1).getTime()
        ),
        afternoon_shift_user_id: operator.id,
        StockProduct: {
          create: {
            amount: randomQuantity,
            invoice_id: null,
            product_id: Math.floor(Math.random() * 3) + 1,
            type: "In",
          },
        },
      },
    });
  }

  await prisma.reportCost.create({
    data: {
      material_id: 1,
      amount: 100,
      factory_id: prsj.id,
      unit_id: 1,
      user_id: operator.id,
    },
  });

  const ppns = await prisma.pPN.create({
    data: {
      desc: "PPN 12%",
      percentage: 12,
    },
  });

  // const buyer = await prisma.buyer.create({
  //   data: {
  //     name: "PT. Iman",
  //     address: "Jl. Iman",
  //     factory_id: prsj.id,
  //   },
  // });

  // const invoice = await prisma.invoice.create({
  //   data: {
  //     factory_id: prsj.id,
  //     user_id: admin.id,
  //     is_distributor: true,
  //     invoice_code: "INV-001",
  //     buyer_id: buyer.id,
  //     maturity_date: new Date("2024-01-01"),
  //     item_amount: 1,
  //     down_payment: 100000,
  //     ppn: ppns.percentage,
  //     payment_method_id: 1,
  //     total: 1000000,
  //     sub_total: 1000000,
  //     remaining_balance: 1000000,
  //     payment_status: "Pending",
  //   },
  // });

  // await prisma.detailInvoice.create({
  //   data: {
  //     product_id: 1,
  //     invoice_id: invoice.id,
  //     desc: "ST Premium",
  //     amount: 1,
  //     sub_total: 1000000,
  //     is_product: true,
  //   },
  // });

  // const location = await prisma.location.create({
  //   data: {
  //     factory_id: prsj.id,
  //     name: "Jl. Delivery",
  //     cost: 100000,
  //   }
  // })

  // await prisma.deliveryTracking.create({
  //   data: {
  //     invoice_id: invoice.id,
  //     desc: "Delivery",
  //     location_id: location.id,
  //     latitude: -6.2088,
  //     longitude: 106.8456,
  //     cost: 100000,
  //     sales_man: "John Doe",
  //     recipient: "PT. Iman",
  //   },
  // });
  for (let i = 1; i <= 1000; i++) {
    const buyer = await prisma.buyer.create({
      data: {
        name: `PT. Iman ${i}`,
        address: `Jl. Iman ${i}`,
        factory_id: prsj.id,
      },
    });
    const products = await prisma.product.findMany({
      where: {
        factory_id: prsj.id,
      },
    });
    const invoiceCode = `INV-${i.toString().padStart(3, "0")}`;
    const baseAmount = Math.floor(Math.random() * 100) + 1; // Random amount between 1 and 100
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const pricePerUnit = randomProduct.price;
    const subTotal = baseAmount * pricePerUnit;
    const total = subTotal + subTotal * (ppns.percentage / 100);
    const downPayment = Math.floor(total * 0.3); // 30% down payment
    const remainingBalance = total - downPayment;
    const paymentStatus = Math.random() < 0.5 ? "Paid" : "Pending";
    const randomPaymentMethod = Math.floor(Math.random() * 5) + 1;
    const invoice = await prisma.invoice.create({
      data: {
        factory_id: prsj.id,
        created_at: new Date(
          Math.floor(
            Math.random() * (Date.now() - new Date(2025, 0, 1).getTime())
          ) + new Date(2025, 0, 1).getTime()
        ),
        user_id: admin.id,
        is_distributor: true,
        invoice_code: invoiceCode,
        buyer_id: buyer.id,
        maturity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        item_amount: baseAmount,
        down_payment: downPayment,
        ppn: ppns.percentage,
        payment_method_id: randomPaymentMethod,
        total: total,
        sub_total: subTotal,
        remaining_balance: remainingBalance,
        payment_status: paymentStatus,
        detailInvoices: {
          create: {
            product_id: randomProduct.id,
            desc: randomProduct.name,
            amount: baseAmount,
            price: pricePerUnit,
            sub_total: subTotal,
            is_product: true,
          },
        },
      },
    });

    // Create location and delivery tracking for each invoice
    const location = await prisma.location.create({
      data: {
        factory_id: prsj.id,
        name: `Jl. Delivery ${i}`,
        cost: 50000 + Math.random() * 100000, // Random cost between 50000 and 150000
      },
    });

    await prisma.deliveryTracking.create({
      data: {
        invoice_id: invoice.id,
        desc: `Delivery for ${invoiceCode}`,
        location_id: location.id,
        latitude: -6.2088 + Math.random() * 0.1, // Slight random variation in coordinates
        longitude: 106.8456 + Math.random() * 0.1,
        cost: location.cost,
        sales_man: `Sales Person ${i}`,
        recipient: buyer.name,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
