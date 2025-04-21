/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { SessionPayload } from './definitions'
 
const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function generateToken(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function verifyToken(token: string): Promise<any> {
  try {
    return jwtVerify(token, encodedKey, { algorithms: ['HS256'] });
  } catch (error: any) {
    console.error(error ||'Failed to verify session')
  }
}

 
export async function decrypt(session: string | undefined = '') {
  try {
    if(!session) return null;
    const data = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    if(!data) return null;
    return data.payload;
  } catch (error: any) {
    console.error(error ||'Failed to verify session')
  }
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();
  const session = await encrypt(payload)
  cookieStore.set(
    'session',
    session,
    {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    }
  )
}

export async function getSession() {
  const cookieStore = await cookies()
  return cookieStore.get('session')?.value
}


export async function updateSession(payload: SessionPayload) {
  await deleteSession();
  await createSession(payload);
}


export async function deleteSession() 
{
  const cookieStore = await cookies();
  cookieStore.delete('session');
}