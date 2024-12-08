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


export type Role = 'Owner Pabrik' | 'Owner Distributor' | 'Operator Pabrik' | 'Operator Distributor'

export type TypeUser = 'Operator' | 'Administrator'

export type StatusUser = 'Active' | 'Inactive'

export type Position = 'Operator' | 'Owner'

export type Factory = {
  id: string;
  name: string;
  address: string;
  position: Position[];
}

export type SessionPayload = {
  id: string;
  email: string;
  username: string;
  typeUser: TypeUser;
  role: Role[];
  statusUser: StatusUser;
  factory: Factory[];
  thumbnail: string | "";
}
