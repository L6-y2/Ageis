import { NextRequest, NextResponse } from 'next/server'
import { reviewTopic, updateTopicMastery } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { topicId, grade, masteryLevel } = await req.json()
    if (!topicId) {
      return NextResponse.json({ error: 'Missing topicId' }, { status: 400 })
    }

    if (typeof grade === 'number') {
      const res = await reviewTopic(Number(topicId), grade)
      return NextResponse.json({ success: true, data: res })
    }

    if (typeof masteryLevel === 'number') {
      const res = await updateTopicMastery(Number(topicId), masteryLevel)
      return NextResponse.json({ success: true, data: res })
    }

    return NextResponse.json({ error: 'Provide either grade or masteryLevel' }, { status: 400 })
  } catch (err: any) {
    console.error('Mastery API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
