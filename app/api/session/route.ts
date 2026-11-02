import { NextRequest, NextResponse } from 'next/server'
import { recordStudySession } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { subjectId, durationMinutes, topicId } = await req.json()
    if (!subjectId || !durationMinutes) {
      return NextResponse.json({ error: 'Missing subjectId or durationMinutes' }, { status: 400 })
    }

    const result = await recordStudySession(Number(subjectId), Number(durationMinutes), topicId ? Number(topicId) : undefined)
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('Session API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
