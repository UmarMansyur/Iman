import { cookies } from 'next/headers';
import { decrypt } from './session';

const getToken = async () => {
  const cookie = (await cookies()).get('session')?.value;
  return cookie;
}

const getSession = async () => {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  return session;
}

export {
  getToken,
  getSession,
};
