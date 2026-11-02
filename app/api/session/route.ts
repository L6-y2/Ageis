import { NextRequest, NextResponse } from 'next/server'
import {
  startStudySession,
  endStudySession,
  getActiveStudySession,
  cancelStudySession,
  recordStudySession,
} from '@/lib/api'

export async function GET() {
  try {
    const active = await getActiveStudySession()
    return NextResponse.json({ activeSession: active })
  } catch (err: any) {
    console.error('Get active session error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      action,
      subjectId,
      sessionId,
      notes,
      energyLevel,
      taskRefId,
      taskRefType,
      durationMinutes,
      topicId,
    } = body

    // 1. Start a new session in database
    if (action === 'start') {
      if (!subjectId) {
        return NextResponse.json({ error: 'Missing subjectId' }, { status: 400 })
      }
      const data = await startStudySession(
        Number(subjectId),
        notes,
        energyLevel || 'medium',
        taskRefId ? Number(taskRefId) : undefined,
        taskRefType || 'general'
      )
      return NextResponse.json({ success: true, data })
    }

    // 2. End and complete session (awards XP, recalculates streak & hours)
    if (action === 'end') {
      const data = await endStudySession(
        sessionId ? Number(sessionId) : undefined,
        notes,
        energyLevel
      )
      return NextResponse.json({ success: true, data })
    }

    // 3. Cancel active session
    if (action === 'cancel') {
      const ok = await cancelStudySession(sessionId ? Number(sessionId) : undefined)
      return NextResponse.json({ success: ok })
    }

    // 4. Fallback: single record
    if (subjectId && durationMinutes) {
      const result = await recordStudySession(
        Number(subjectId),
        Number(durationMinutes),
        topicId ? Number(topicId) : undefined
      )
      return NextResponse.json({ success: true, data: result })
    }

    return NextResponse.json({ error: 'Invalid session action or parameters' }, { status: 400 })
  } catch (err: any) {
    console.error('Session API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
