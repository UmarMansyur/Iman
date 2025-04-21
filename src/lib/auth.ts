import { cookies } from 'next/headers';
import bcrypt from 'bcrypt'
import { PrismaClient, User } from '@prisma/client'
import { redirect } from 'next/navigation';
const prisma = new PrismaClient();


export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    throw new Error("User not found.");
  }
  const passwordsMatch = await bcrypt.compare(password, user.password);
  return passwordsMatch ? user : null;
}

export async function createSession(user: User) {
  const cookieStore = await cookies();
  cookieStore.set("session", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/'
  })
  return user
}

export async function decrypt() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  if(cookie) {
    return JSON.parse(cookie)
  }
  redirect('/login')
}