// lib/sessionClient.ts
import { SessionPayload } from './definitions'

export const getClientSession = async (): Promise<SessionPayload | null> => {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include' // penting untuk mengirim cookies
    });
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};