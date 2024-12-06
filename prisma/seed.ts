import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(): Promise<void> {
  const admin = await prisma.user.create({
    data: {
      email: "admin@iman.com",
      username: "admin",
      password: "admin",
      date_of_birth: new Date("2001-07-29"),
      gender: "Male",
      user_type: "Administrator",
      address: "Jl. Admin",
      is_active: true,
      is_verified: true,
    }
  });

  const operator = await prisma.user.create({
    data: {
      email: "operator@iman.com",
      username: "operator",
      password: "operator",
      date_of_birth: new Date("2001-07-29"),
      gender: "Male",
      address: "Jl. Operator",
      user_type: "Operator",
      is_active: true,
      is_verified: true,
    }
  });

  const djava = await prisma.factory.create({
    data: {
      nickname: "Djava",
      name: "Djava",
      address: "Jl. Djava",
      status: "Active",
    }
  });

  const roles = await prisma.role.createMany({
    data: [
      { role: "Owner" },
      { role: "Operator" },
    ]
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
    ]
  });

  const bankDjava = await prisma.bankAccount.createMany({
    data: [
      {
        factory_id: djava.id,
        name: "Bank Djava",
        rekening: "1234567890",
        bank_name: "Bank Negara Indonesia",
      }
    ]
  });

  const paymentMethod = await prisma.paymentMethod.createMany({
    data: [
      { name: "Transfer" },
      { name: "Cash" },
      { name: "Virtual Account" },
      { name: "QRIS" },
      { name: "BOND" },
      { name: "KREDIT" },
    ]
  });

  const materials = await prisma.material.createMany({
    data: [
      { name: "TSG" },
      { name: "Filter" },
      { name: "Bobin" },
      { name: "Etiket"},
      { name: "Foil Gold"},
      { name: "Foil Silver"},
      { name: "Inner"},
      { name: "CPT"},
      { name: "Lem CTP"},
      { name: "Lem AMBRI"},
      { name: "Pita SKM"},
      { name: "Pita SPM"},
      { name: "Pita SKT"},
    ]
  });

  const unit = await prisma.unit.createMany({
    data: [
      { name: "Kg" },
      { name: "Try" },
      { name: "Meter" },
      { name: "Box" },
      { name: "Pack" },
      { name: "Roll" },
      { name: "Kardus" },
      { name: "Lusin" },
      { name: "Karton" },
      { name: "Rolls" },
      { name: "Keping" },
      { name: "Pcs" },
      { name: "Press" },
      { name: "Ball" },
    ]
  });

  const product = await prisma.product.createMany({
    data: [
      { 
        factory_id: djava.id,
        name: "ST Premium",
        unit_id: 5,
      },
    ]
  });

  const productUnit = await prisma.unit.createMany({
    data: [
      { name: "Box", parent_unit_id: 5, convert_from_parent: 12 },
    ]
  });


  const materialStock = await prisma.materialStock.createMany({
    data: [
      { material_id: 1, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 2, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 3, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 4, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 5, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 6, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 7, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 8, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 9, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 10, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 11, factory_id: djava.id, unit_id: 1, amount: 1000 },
      { material_id: 12, factory_id: djava.id, unit_id: 1, amount: 1000 },
    ]
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