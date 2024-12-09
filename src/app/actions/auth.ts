/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
import { createSession, deleteSession } from '@/lib/session';
import prisma from '@/lib/db';
import { SigninFromSchema, SigninFormState, SessionPayload, Role, Position } from '@/lib/definitions'
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { User } from '@prisma/client';

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
  let user: any = null;
  try {
    user = await prisma.user.findFirst({
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
      role: user?.memberFactories.map((member: any) => member.role.role as Role),
      statusUser: user.is_active ? 'Active' : 'Inactive',
      factory: user?.memberFactories.map((member: any) => ({
        id: member.factory.id.toString(),
        name: member.factory.name,
        logo: member.factory.logo,
        address: member.factory.address,
        status: member.factory.status,
        position: [member.role.role as Position]
      })),
      factory_selected: user?.memberFactories.length > 0 ? user?.memberFactories[0].factory : null,
      thumbnail: user.thumbnail ?? "",
    };

    await createSession(payload);
  } catch (error: any) {
    return {
      message: error.message || 'Terjadi kesalahan saat login'
    }
  }
  if(user?.user_type === 'Administrator') {
    redirect('/admin/dashboard');
  } else if(user?.user_type === 'Operator') {
    // jika memiliki user.factory.position.includes('Owner')
    if(user?.factory.some((factory: any) => factory.position.includes('Owner'))) {
      redirect('/owner');
    } else {
      redirect('/operator');
    }
  }
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

