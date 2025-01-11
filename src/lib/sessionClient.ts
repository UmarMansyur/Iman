/* eslint-disable @typescript-eslint/no-explicit-any */
export const getClientSession = async (): Promise<any | null> => {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.session;
  } catch (error: any) {
    return error.message;
  }
};