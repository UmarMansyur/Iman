/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
import { createSession, deleteSession } from '@/lib/session';
import prisma from '@/lib/db';
import { SigninFromSchema, SigninFormState, SessionPayload, Role, Position } from '@/lib/definitions'
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';

export async function login(state: SigninFormState, formData: FormData) {
  const validatedFields = SigninFromSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email
      },
      include: {
        memberFactories: {
          include: {
            role: true,
            factory: true
          }
        },
      }
    });

    if(!user) {
      throw new Error('Akun yang anda masukkan tidak terdaftar');
    }

    const passwordMatch = await bcrypt.compare(password, user?.password || '');
    if (!passwordMatch) {
      return {
        errors: {
          password: ['Password salah']
        }
      }
    }

    const payload: SessionPayload = {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      typeUser: user.user_type,
      role: user.memberFactories.map((member) => member.role.role as Role),
      statusUser: user.is_active ? 'Active' : 'Inactive',
      factory: user.memberFactories.map((member) => ({
        id: member.factory.id.toString(),
        name: member.factory.name,
        address: member.factory.address,
        position: [member.role.role as Position]
      })),
      thumbnail: user.thumbnail ?? "",
    };

    await createSession(payload);
  } catch (error: any) {
    return {
      message: error.message || 'Terjadi kesalahan saat login'
    }
  }

  redirect('/admin/dashboard');
}

export async function logout() {
  console.log('logout');
  await deleteSession();
  redirect('/login');
}

