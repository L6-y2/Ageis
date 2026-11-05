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

// GET: Fetch all tasks, exams, backlog, and lectures
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'

    const fetchTable = async (table: string, order = 'created_at.desc') => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=${order}`, {
        headers,
        cache: 'no-store',
      })
      if (!res.ok) return []
      return res.json()
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

    // Fetch all
    const [assignments, exams, backlog, lectures] = await Promise.all([
      fetchTable('assignments'),
      fetchTable('exams'),
      fetchTable('backlog'),
      fetchTable('lectures'),
    ])

    return NextResponse.json({
      assignments,
      exams,
      backlog,
      lectures,
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

// PATCH: Update status of an item
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, id, status } = body

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
