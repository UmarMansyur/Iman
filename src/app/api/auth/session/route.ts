import { getSession } from '@/lib/token';
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ session: null })
    }
    return NextResponse.json({ session: session })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ session: null })
  }
}