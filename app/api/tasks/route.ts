export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crbfhqpklruvbgcanuoo.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYmZocXBrbHJ1dmJnY2FudW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0Mjc4NTcsImV4cCI6MjEwOTAwMzg1N30.W8YLY_kiGqHvLs5LFDxHP0goL0vRJ18HtzdPLa0mXjY'

const headers = {
  'Content-Type': 'application/json',
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
}

// GET: Fetch tasks, assignments, exams, backlog, lectures, and spaced repetition reviews
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'
    const subjectId = searchParams.get('subject_id') ? parseInt(searchParams.get('subject_id')!) : null

    const fetchTable = async (table: string, order = 'created_at.desc') => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=${order}`, {
        headers,
        cache: 'no-store',
      })
      if (!res.ok) return []
      const items = await res.json()
      if (subjectId) {
        return items.filter((item: any) => item.subject_id === subjectId)
      }
      return items
    }

    const fetchReviews = async () => {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/curriculum_topics?select=id,subject_id,chapter,topic,mastery_level,next_review_date,interval_days,repetitions,easiness_factor&order=next_review_date.asc`,
        {
          headers,
          cache: 'no-store',
        }
      )
      if (!res.ok) return []
      const items = await res.json()
      if (subjectId) {
        return items.filter((item: any) => item.subject_id === subjectId)
      }
      return items
    }

    if (type === 'assignments') {
      const data = await fetchTable('assignments')
      return NextResponse.json(data)
    }
    if (type === 'exams') {
      const data = await fetchTable('exams')
      return NextResponse.json(data)
    }
    if (type === 'backlog') {
      const data = await fetchTable('backlog')
      return NextResponse.json(data)
    }
    if (type === 'lectures') {
      const data = await fetchTable('lectures')
      return NextResponse.json(data)
    }
    if (type === 'reviews') {
      const data = await fetchReviews()
      return NextResponse.json(data)
    }

    // Fetch all 5 categories
    const [assignments, exams, backlog, lectures, reviews] = await Promise.all([
      fetchTable('assignments'),
      fetchTable('exams'),
      fetchTable('backlog'),
      fetchTable('lectures'),
      fetchReviews(),
    ])

    return NextResponse.json({
      assignments,
      exams,
      backlog,
      lectures,
      reviews,
    })
  } catch (err: any) {
    console.error('Fetch tasks error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: Create a new item (assignment, exam, backlog, lecture)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, ...payload } = body

    if (!['assignments', 'exams', 'backlog', 'lectures'].includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: 400 })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Create task error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH: Update status of an item OR rate a Spaced Repetition (SM-2) review
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, id, status, grade } = body

    // 1. Spaced Repetition (SM-2) Rating
    if (table === 'reviews' || typeof grade === 'number') {
      const topicId = id || body.topicId
      const rateGrade = typeof grade === 'number' ? grade : 5

      const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rpc_sm2_update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ p_topic_id: topicId, p_grade: rateGrade }),
      })

      if (!rpcRes.ok) {
        const err = await rpcRes.text()
        return NextResponse.json({ error: err }, { status: 400 })
      }

      const sm2Data = await rpcRes.json()

      // Award XP for spaced repetition review:
      // Grade 5: 15 XP, Grade 4: 10 XP, Grade 3: 5 XP, Grade 1: 2 XP
      const xpAmount = rateGrade >= 5 ? 15 : rateGrade >= 4 ? 10 : rateGrade >= 3 ? 5 : 2
      const topicName = sm2Data.topic || `درس #${topicId}`

      try {
        await fetch(`${SUPABASE_URL}/rest/v1/xp_transactions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: xpAmount,
            reason: `مراجعة تكرار متباعد: ${topicName}`,
            source_type: 'topic_mastered',
            source_id: topicId,
          }),
        })
      } catch (e) {
        console.error('XP grant error in SM-2:', e)
      }

      return NextResponse.json({ success: true, data: sm2Data, earnedXp: xpAmount })
    }

    // 2. Regular Task Toggle (assignments, exams, backlog, lectures)
    if (!['assignments', 'exams', 'backlog', 'lectures'].includes(table) || !id || !status) {
      return NextResponse.json({ error: 'Missing table, id, or status' }, { status: 400 })
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ status }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: 400 })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Update task error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
