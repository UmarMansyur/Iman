import { cookies } from 'next/headers';
import { decrypt } from './session';
import { SessionPayload } from './definitions';

const getToken = async () => {
  const cookie = (await cookies()).get('session')?.value;
  return cookie;
}

const getSession = async (): Promise<SessionPayload | null> => {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  return session as SessionPayload | null;
}

export {
  getToken,
  getSession,
};
