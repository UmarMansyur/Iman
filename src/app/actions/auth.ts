/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
import { createSession, deleteSession } from '@/lib/session';
import prisma from '@/lib/db';
import { SigninFromSchema, SigninFormState, SessionPayload, Role, Position } from '@/lib/definitions'
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { MemberFactoryStatus } from '@prisma/client';

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
  let sessionUser: any = null;
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
        status_member: member.status as MemberFactoryStatus,
        position: [member.role.role as Position]
      })),
      factory_selected: user?.memberFactories.length > 0 ? {
        id: user?.memberFactories[0].factory.id.toString(),
        name: user?.memberFactories[0].factory.name,
        logo: user?.memberFactories[0].factory.logo,
        address: user?.memberFactories[0].factory.address,
        status: user?.memberFactories[0].factory.status,
        status_member: user?.memberFactories[0].status as string,
        position: [user?.memberFactories[0].role.role as Position]
      } : null,
      thumbnail: user.thumbnail ?? "",
    };
  
    sessionUser = payload;

    await createSession(payload);
  } catch (error: any) {
    return {
      message: error.message || 'Terjadi kesalahan saat login'
    }
  }
  if(sessionUser?.typeUser === 'Administrator') {
    redirect('/admin/dashboard');
  } else if(sessionUser?.typeUser === 'Operator') {
    if(sessionUser?.factory.find((factory: any) => factory.position.includes('Owner'))) {
      redirect('/owner');
    } else if(sessionUser?.factory.find((factory: any) => factory.position.includes('Distributor'))) {
      redirect('/distributor');
    } else if(sessionUser?.factory.find((factory: any) => factory.position.includes('Operator'))) {
      redirect('/operator');
    } else if(sessionUser?.factory.find((factory: any) => factory.position.includes('Owner Distributor'))) {
      redirect('/owner-distributor');
    } else {
      redirect('/401');
    }
  }
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

