import { FactoryStatus, MaterialStockStatus, MemberFactoryStatus, ProductType, User } from "@prisma/client";
import { z } from "zod";

export const SingupFromSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, { message: "Harus mengandung huruf." })
    .regex(/[0-9]/, { message: "Harus mengandung angka." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Harus mengandung simbol.",
    })
    .trim(),
});

export type SingupFormType =
  | {
      errors?: {
        username?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const SigninFromSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(4, "Password minimal 4 karakter"),
});

export type SigninFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type Role =
  | "Owner Pabrik"
  | "Owner Distributor"
  | "Operator Pabrik"
  | "Operator Distributor";

export type TypeUser = "Operator" | "Administrator";

export type StatusUser = "Active" | "Inactive";

export type Position = "Operator" | "Owner" | "Distributor" | "Owner Distributor" | "Administrator";

export type Factory = {
  id: string;
  name: string;
  address: string;
  logo: string | null;
  status: FactoryStatus;
  status_member: string;
  position: Position[];
};

export type SessionPayload = {
  id: string;
  email: string;
  username: string;
  typeUser: TypeUser;
  role: Role[];
  statusUser: StatusUser;
  factory: Factory[];
  thumbnail: string | "";
  factory_selected: Factory | null;
};

export const UserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  gender: z
    .enum(["Male", "Female"], {
      required_error: "Pilih jenis kelamin",
    })
    .optional(),
  date_of_birth: z.coerce.date({
    required_error: "Pilih tanggal lahir",
  }),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  user_type: z.enum(["Operator", "Administrator"], {
    required_error: "Pilih tipe pengguna",
  }),
  thumbnail: z.any(),
});

export type UserFormState =
  | {
      errors?: {
        email?: string[];
        username?: string[];
        password?: string[];
        gender?: string[];
        date_of_birth?: string[];
        address?: string[];
        user_type?: string[];
        thumbnail?: string[];
      };
      message?: string;
    }
  | undefined;

export const UpdateUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  gender: z.enum(["Male", "Female"], {
    required_error: "Pilih jenis kelamin",
  }),
  date_of_birth: z.coerce.date({
    required_error: "Pilih tanggal lahir",
  }),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  user_type: z.enum(["Operator", "Administrator"], {
    required_error: "Pilih tipe pengguna",
  }),
  thumbnail: z
    .any()
    .optional()
    .refine((file) => {
      if (!file) return true;
      // Periksa ukuran file dalam bytes (5MB)
      return file.size <= 5 * 1024 * 1024;
    }, "Ukuran file maksimal 5MB")
    .refine((file) => {
      if (!file) return true;
      // Periksa tipe MIME
      return file.mimetype?.startsWith("image/");
    }, "File harus berupa gambar"),
});

export type UpdateUserFormState =
  | {
      errors?: {
        email?: string[];
        username?: string[];
        gender?: string[];
        date_of_birth?: string[];
        address?: string[];
        user_type?: string[];
        thumbnail?: string[];
      };
      message?: string;
    }
  | undefined;

export type MemberFactory = {
  id: number;
  user: User;
  factory: Factory;
};

export type FactoryTable = {
  id: number;
  nickname: string;
  name: string;
  logo: string | null;
  address: string;
  user_id: string;
  user: User;
  status: FactoryStatus;
  members: MemberFactory[];
  created_at: string;
  updated_at: string;
};

export const FactorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nickname: z.string().min(3, "Nama Singkat minimal 3 karakter"),
  user_id: z.string().optional(),
  logo: z.any().optional(),
  status: z
    .enum(["Active", "Pending", "Inactive", "Suspended"])
    .default("Pending"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
});

export type FactoryFormState =
  | {
      errors?: {
        name?: string[];
        nickname?: string[];
        user_id?: string[];
        logo?: string[];
        status?: string[];
      };
      message?: string;
    }
  | undefined;

export type Unit = {
  id: number;
  name: string;
};

export const UnitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama minimal 3 karakter"),
});

export type UnitFormState =
  | {
      errors?: {
        name?: string[];
      };
      message?: string;
    }
  | undefined;

export type Material = {
  id: number;
  name: string;
};

export const MaterialSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama minimal 3 karakter"),
});

export type MaterialFormState =
  | {
      errors?: {
        name?: string[];
      };
      message?: string;
    }
  | undefined;

export type RoleUser = {
  id: number;
  role: string;
};

export const RoleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama minimal 3 karakter"),
});

export type RoleFormState =
  | {
      errors?: {
        name?: string[];
      };
      message?: string;
    }
  | undefined;

export const PaymentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama minimal 3 karakter"),
});

export type PaymentFormState =
  | {
      errors?: {
        name?: string[];
      };
      message?: string;
    }
  | undefined;

export type PaymentSetting = {
  id: number;
  name: string;
  price: number;
  per_slop: number;
  per_bal: number;
  per_karton: number;
};

export type Product = {
  id: number;
  name: string;
  type: ProductType;
  price: number;
};

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama minimal 3 karakter"),
  type: z.enum(["Kretek", "Gabus"]),
  factory_id: z.string(),
  price: z.string(),
  per_slop: z.string().optional(),
  per_bal: z.string().optional(),
  per_karton: z.string().optional(),
});

export type ProductFormState =
  | {
      errors?: {
        name?: string[];
        type?: string[];
        price?: string[];
        per_slop?: string[];
        per_bal?: string[];
        per_karton?: string[];
      };
      message?: string;
    }
  | undefined;

export type MaterialUnit = {
  id: number;
  material_id: number;
  unit_id: number;
};

export const MaterialUnitSchema = z.object({
  id: z.string().optional(),
  factory_id: z.string(),
  material_id: z.string(),
  unit_id: z.string(),
});

export type MaterialUnitFormState =
  | {
      errors?: {
        id?: string[];
        material_id?: string[];
        unit_id?: string[];
        factory_id: string[];
      };
      message?: string;
    }
  | undefined;

export const MemberFactorySchema = z.object({
  id: z.string().optional(),
  factory_id: z.string(),
  user_id: z.string(),
  role_id: z.string(),
  status: z
    .enum(["Active", "Pending", "Inactive", "Suspended"])
    .default("Pending"),
});

export type Operator = {
  id: number;
  factory_id: number;
  user_id: number;
  role: RoleUser;
  status: MemberFactoryStatus;
};

export type MemberFactoryFormState =
  | {
      errors?: {
        id?: string[];
        factory_id?: string[];
        user_id?: string[];
        role_id?: string[];
        status?: string[];
      };
      message?: string;
    }
  | undefined;


  export type DropdownOptions = {
    label: string;
    value: string;
  }

  export type DropdownUser = {
    label: string;
    value: string;
    thumbnail: string;
    email: string;
  }


  export type ProductUnit = {
    id: number,
    product_id: number,
    unit_id: number,
    amount: number,
    parent_id?: number,
    convert_from_parent?: number,
    factory_id: number,
  }

  export const ProductUnitSchema = z.object({
    id: z.string().optional(),
    product_id: z.string(),
    unit_id: z.string(),
    amount: z.string(),
    parent_id: z.string().optional(),
    convert_from_parent: z.string().optional(),
    factory_id: z.string(),
  });

export type ProductUnitFormState =
  | {
      errors?: {
        product_id?: string[];
        unit_id?: string[];
        amount?: string[];
        parent_id?: string[];
        convert_from_parent?: string[];
        factory_id?: string[];
      };
      message?: string;
    }
  | undefined;


  export type PriceProductUnit = {
    id: number,
    product_unit_id: number,
    price: number,
    sale_price: number,
    // status: PriceProductUnitStatus,
  }

  export const PriceProductUnitSchema = z.object({
    id: z.string().optional(),
    product_unit_id: z.string(),
    price: z.string(),
    sale_price: z.string(),
    status: z.enum(["Active", "Inactive"]),
  });

  export type PriceProductUnitFormState =
  | {
      errors?: {
        product_unit_id?: string[];
        price?: string[];
        sale_price?: string[];
        status?: string[];
      };
      message?: string;
    }
  | undefined;


export type MaterialStock = {
  id: number,
  material_unit_id: number,
  amount: number,
  amount_morning: number,
  amount_afternoon: number,
  morning_shift_time: string,
  afternoon_shift_time: string,
  status: MaterialStockStatus,
  user_morning_id: number,
  user_afternoon_id: number,
}

export const MaterialStockSchema = z.object({
  id: z.string().optional(),
  material_unit_id: z.string(),
  amount: z.string(),
  amount_morning: z.string().optional(),
  amount_afternoon: z.string().optional(),
  morning_shift_time: z.string().optional(),
  afternoon_shift_time: z.string().optional(),
  status: z.enum(["In", "Out"]),
  user_morning_id: z.string().optional(),
  user_afternoon_id: z.string().optional(),
});

export type MaterialStockFormState =
  | {
      errors?: {
        material_unit_id?: string[];
        amount?: string[];
        amount_morning?: string[];
        amount_afternoon?: string[];
        morning_shift_time?: string[];
        afternoon_shift_time?: string[];
        status?: string[];
        user_morning_id?: string[];
        user_afternoon_id?: string[];
      };
      message?: string;
    }
  | undefined;
