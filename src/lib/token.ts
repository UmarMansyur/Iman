/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from 'next/headers';
import { decrypt, updateSession } from './session';
import { Position, SessionPayload, Role } from './definitions';
import prisma from './db';
import { MemberFactoryStatus } from '@prisma/client';

const getToken = async () => {
  const cookie = (await cookies()).get('session')?.value;
  return cookie;
}

const getSession = async (): Promise<SessionPayload | null> => {
  const cookie = (await cookies()).get('session')?.value;
  if(!cookie) return null;
  const session = await decrypt(cookie);
  if(!session) return null;
  const user: any = await prisma.user.findUnique({
    where: {
      id: parseInt(session?.id as string),
    },
    include: {
      memberFactories: {
        include: {
          role: true,
          factory: true,
        }
      }
    },
  });

  if(!user) return null;

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
      position: [member.role.role as Position],
      status_member: member.status as MemberFactoryStatus
    })),
    factory_selected: user?.memberFactories.length > 0 ? {
      id: user?.memberFactories[0].factory.id.toString(),
      name: user?.memberFactories[0].factory.name,
      logo: user?.memberFactories[0].factory.logo,
      address: user?.memberFactories[0].factory.address,
      status: user?.memberFactories[0].factory.status,
      position: [user?.memberFactories[0].role.role as Position],
      status_member: user?.memberFactories[0].status as MemberFactoryStatus
    } : null,
    thumbnail: user.thumbnail ?? "",
  }

  await updateSession(payload);

  return payload as SessionPayload | null;
}

export {
  getToken,
  getSession,
};
