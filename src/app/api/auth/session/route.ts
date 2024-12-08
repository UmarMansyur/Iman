// app/api/auth/session/route.ts
import { getSession, decrypt } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ session: null })
    }

    const decodedSession = await decrypt(session)
    return NextResponse.json({ session: decodedSession })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ session: null })
  }
}