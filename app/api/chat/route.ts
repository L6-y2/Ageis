import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'models/gemini-3-flash-preview'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crbfhqpklruvbgcanuoo.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYmZocXBrbHJ1dmJnY2FudW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0Mjc4NTcsImV4cCI6MjEwOTAwMzg1N30.W8YLY_kiGqHvLs5LFDxHP0goL0vRJ18HtzdPLa0mXjY'

const SYSTEM_PROMPT = `أنت "إيجيس" (Aegis)، نظام ومساعد ذكي لإدارة مذاكرة الطالب والـ Gamification.
قواعدك الصارمة:
1. تتحدث بأسلوب عملي، محترم، مباشر ومختصر باللهجة المصرية البسيطة، بدون مبالغة أو دراما.
2. المنهج مسجل بدقة في قاعدة البيانات عبر 4 مواد:
   - اللغة العربية (ID: 6): 68 درساً
   - البرمجة (ID: 7): 23 درساً
   - اللغة الإنجليزية (ID: 8): 45 درساً
   - التاريخ (ID: 9): 24 درساً
3. مراحل الإتقان الخمسة المعتمدة في النظام:
   - لم يبدأ بعد (مستوى 0)
   - تمت القراءة (مستوى 1)
   - تم التلخيص والحل (مستوى 2 أو 3)
   - تحت المراجعة (مستوى 4)
   - متقن تماماً (مستوى 5)
4. لا تخترع أي دروس أو نسب أو أرقام من خيالك أبداً. كل البيانات التي تجيب بها تأتي فقط من الـ Context المرفق لك من قاعدة بيانات Supabase.
5. إذا قام النظام بتعديل قاعدة البيانات، أكد للطالب التعديل بوضوح واذكر اسم الدرس والمستوى الجديد.
6. أنهِ إجابتك دائماً بالكامل بدون توقف في منتصف الجمل.`

async function getMasteryReport(subjectId?: number) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rpc_get_mastery_report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify(subjectId ? { p_subject_id: subjectId } : {}),
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function detectSubject(text: string): { id: number; name: string } | null {
  const lower = text.toLowerCase()
  if (lower.includes('عربي') || lower.includes('نحو') || lower.includes('بلاغة') || lower.includes('نصوص')) {
    return { id: 6, name: 'اللغة العربية' }
  }
  if (lower.includes('برمج') || lower.includes('كود') || lower.includes('python') || lower.includes('web') || lower.includes('ai')) {
    return { id: 7, name: 'البرمجة' }
  }
  if (lower.includes('إنجليزي') || lower.includes('انجليزي') || lower.includes('english')) {
    return { id: 8, name: 'اللغة الإنجليزية' }
  }
  if (lower.includes('تاريخ') || lower.includes('history')) {
    return { id: 9, name: 'التاريخ' }
  }
  return null
}

interface ActionPayload {
  type: 'NAVIGATE' | 'DATABASE_UPDATED' | 'TASK_CREATED'
  route?: string
  label?: string
  topicId?: number
  newLevel?: number
  newLabel?: string
  task?: {
    id?: number
    table?: string
    title?: string
    dueDate?: string
  }
}

function getNextDayOfWeek(date: Date, dayOfWeek: number) {
  const resultDate = new Date(date.getTime())
  resultDate.setDate(date.getDate() + ((7 + dayOfWeek - date.getDay()) % 7 || 7))
  return resultDate
}

// ─── Automatic Task Creation in Supabase ──────────────────────────────────
async function handleDatabaseTaskCreation(message: string): Promise<ActionPayload | null> {
  const text = message.toLowerCase()

  const taskKeywords = [
    'ضيف مهمة', 'سجل مهمة', 'حط مهمة', 'أضف مهمة', 'اضف مهمة',
    'ضيف واجب', 'سجل واجب', 'حط واجب', 'أضف واجب', 'اضف واجب',
    'عندي امتحان', 'ضيف امتحان', 'سجل امتحان', 'عندي اختبار', 'ضيف اختبار',
    'ضيف في المهام', 'ضيف لي في المهام', 'سجل في المهام', 'حط في المهام',
    'ضيف تكليف', 'سجل تكليف', 'ضيف محاضرة', 'سجل محاضرة', 'عندي كويز',
    'ضيف لي مهمة', 'سجل لي مهمة', 'ضيف لي واجب', 'سجل لي واجب'
  ]

  const matches = taskKeywords.some((k) => text.includes(k))
  if (!matches) return null

  const detectedSubject = detectSubject(message)
  const subjectId = detectedSubject?.id || 6

  let table = 'assignments'
  const isExam = text.includes('امتحان') || text.includes('اختبار') || text.includes('كويز')
  const isLecture = text.includes('محاضرة') || text.includes('حصة')
  const isBacklog = text.includes('تأجيل') || text.includes('مؤجل') || text.includes('باكلوج')

  if (isExam) table = 'exams'
  else if (isLecture) table = 'lectures'
  else if (isBacklog) table = 'backlog'
  else table = 'assignments'

  const now = new Date()
  let targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  if (text.includes('النهاردة') || text.includes('اليوم')) {
    targetDate = now
  } else if (text.includes('بعد بكرة') || text.includes('بعد غد')) {
    targetDate = new Date(now.getTime() + 48 * 60 * 60 * 1000)
  } else if (text.includes('السبت')) {
    targetDate = getNextDayOfWeek(now, 6)
  } else if (text.includes('الأحد') || text.includes('الاحد')) {
    targetDate = getNextDayOfWeek(now, 0)
  } else if (text.includes('الاثنين') || text.includes('الإثنين')) {
    targetDate = getNextDayOfWeek(now, 1)
  } else if (text.includes('الثلاثاء')) {
    targetDate = getNextDayOfWeek(now, 2)
  } else if (text.includes('الأربعاء') || text.includes('الاربعاء')) {
    targetDate = getNextDayOfWeek(now, 3)
  } else if (text.includes('الخميس')) {
    targetDate = getNextDayOfWeek(now, 4)
  } else if (text.includes('الجمعة')) {
    targetDate = getNextDayOfWeek(now, 5)
  }

  const dueDateStr = targetDate.toISOString().split('T')[0]

  let cleanTitle = message
    .replace(/^(من فضلك|لو سمحت|عايزك|ممكن)?\s*(ضيف|سجل|حط|أضف|اضف|اعمل|سجلي|ضيفلي|ضيف لي|سجل لي|عندي)\s*(لي)?\s*(مهمة|واجب|امتحان|اختبار|محاضرة|تكليف)?\s*(جديد|جديدة)?\s*(:|-)?\s*/gi, '')
    .replace(/\s*(في جدول الامتحانات|في قائمة المهام|في المهام|في الواجبات)\s*/gi, ' ')
    .replace(/\s*(بكرة|النهاردة|اليوم|غداً|غدا|بعد بكرة|بعد غد)\s*/gi, ' ')
    .replace(/\s*يوم\s+(السبت|الأحد|الاحد|الاثنين|الإثنين|الثلاثاء|الأربعاء|الاربعاء|الخميس|الجمعة)\s*/gi, ' ')
    .replace(/\s*(السبت|الأحد|الاحد|الاثنين|الإثنين|الثلاثاء|الأربعاء|الاربعاء|الخميس|الجمعة)\s*/gi, ' ')
    .trim()

  if (isExam && !cleanTitle.includes('امتحان') && !cleanTitle.includes('اختبار')) {
    cleanTitle = `امتحان ${cleanTitle}`
  }

  if (!cleanTitle || cleanTitle.length < 3) {
    cleanTitle = `مذاكرة ومتابعة ${detectedSubject?.name || 'المنهج'}`
  }

  let insertBody: any = {}
  if (table === 'assignments') {
    insertBody = {
      subject_id: subjectId,
      title: cleanTitle,
      due_date: dueDateStr,
      priority: text.includes('ضروري') || text.includes('مهم جدا') ? 'high' : 'medium',
      status: 'pending',
      notes: 'تمت إضافتها تلقائياً بواسطة إيجيس الذكي',
    }
  } else if (table === 'exams') {
    let examType = 'quiz'
    if (text.includes('نهائي') || text.includes('آخر العام')) examType = 'final'
    else if (text.includes('نصف العام') || text.includes('ميدترم')) examType = 'midterm'

    insertBody = {
      subject_id: subjectId,
      exam_type: examType,
      title: cleanTitle,
      exam_date: dueDateStr,
      syllabus_coverage: 'المنهج المقرر',
      status: 'upcoming',
    }
  } else if (table === 'lectures') {
    insertBody = {
      subject_id: subjectId,
      title: cleanTitle,
      date: dueDateStr,
      status: 'pending',  // القيم المسموح بيها في lectures: pending, missed, done
      notes: 'تمت جدولتها عبر إيجيس',
    }
  } else {
    insertBody = {
      subject_id: subjectId,
      title: cleanTitle,
      estimated_hours: 1.5,
      actual_hours: 0,
      status: 'pending',
    }
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(insertBody),
    })

    if (!res.ok) {
      console.error('Task insert failed:', await res.text())
      return null
    }

    const inserted = await res.json()
    const taskItem = inserted[0]

    return {
      type: 'TASK_CREATED',
      route: '/tasks',
      label: `تمت إضافة المهمة بنجاح: "${cleanTitle}"`,
      task: {
        id: taskItem?.id,
        table,
        title: cleanTitle,
        dueDate: dueDateStr,
      },
    }
  } catch (err) {
    console.error('Error in handleDatabaseTaskCreation:', err)
    return null
  }
}

// ─── Direct Database Mastery Level Updater ─────────────────────────────────
async function handleDatabaseMasteryUpdate(message: string): Promise<ActionPayload | null> {
  const text = message.toLowerCase()

  // 1. Detect target stage
  let targetLevel: number | null = null
  let label = ''

  if (text.includes('متقن') || text.includes('اتقنت') || text.includes('فاهم جدا')) {
    targetLevel = 5
    label = 'متقن تماماً 🌟'
  } else if (text.includes('تحت المراجعة') || text.includes('مراجعة') || text.includes('محتاج مراجعة')) {
    targetLevel = 4
    label = 'تحت المراجعة ⏳'
  } else if (text.includes('تم التلخيص') || text.includes('لخصت') || text.includes('تلخيص') || text.includes('تمارين')) {
    targetLevel = 2
    label = 'تم التلخيص والحل ✍️'
  } else if (text.includes('تمت القراءة') || text.includes('قراءة') || text.includes('قريت') || text.includes('قرأت')) {
    targetLevel = 1
    label = 'تمت القراءة 📖'
  } else if (text.includes('لم يبدأ') || text.includes('لم يقرأ') || text.includes('صفر')) {
    targetLevel = 0
    label = 'لم يبدأ بعد ⚪'
  }

  const hasActionVerb =
    text.includes('غير') ||
    text.includes('خلي') ||
    text.includes('حول') ||
    text.includes('عدل') ||
    text.includes('سجل') ||
    text.includes('خلصت') ||
    text.includes('أنا لسه') ||
    text.includes('أنا لسة') ||
    text.includes('أتقنت') ||
    text.includes('لخصت')

  if (!hasActionVerb || targetLevel === null) return null

  try {
    // 2. Fetch topics to find exact match
    const res = await fetch(`${SUPABASE_URL}/rest/v1/curriculum_topics?select=id,topic,subject_id`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const topics: { id: number; topic: string; subject_id: number }[] = await res.json()

    let matchedTopic: { id: number; topic: string } | null = null

    // Exact or substring match
    for (const t of topics) {
      const cleanName = t.topic.toLowerCase().replace(/^(درس|الوحدة|الفصل|نص)\s+/i, '').trim()
      if (text.includes(cleanName) || text.includes(t.topic.toLowerCase())) {
        matchedTopic = t
        break
      }
    }

    // Keyword match
    if (!matchedTopic) {
      const stopWords = ['مستوى', 'درس', 'خلي', 'غير', 'حول', 'تمت', 'القراءة', 'التلخيص', 'المراجعة', 'متقن', 'عايز', 'من فضلك']
      const words = text.split(/\s+/).filter((w) => w.length > 3 && !stopWords.includes(w))
      for (const w of words) {
        const found = topics.find((t) => t.topic.toLowerCase().includes(w))
        if (found) {
          matchedTopic = found
          break
        }
      }
    }

    if (!matchedTopic) return null

    // 3. Call rpc_update_mastery in Supabase PostgreSQL
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rpc_update_mastery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        p_topic_id: matchedTopic.id,
        p_mastery_level: targetLevel,
      }),
    })

    if (!rpcRes.ok) return null

    return {
      type: 'DATABASE_UPDATED',
      topicId: matchedTopic.id,
      newLevel: targetLevel,
      newLabel: label,
      label: `تم التحديث: ${matchedTopic.topic} -> ${label}`,
    }
  } catch (err) {
    console.error('Database mastery update error:', err)
    return null
  }
}

function detectIntentAction(text: string): ActionPayload | null {
  const lower = text.toLowerCase()
  const subject = detectSubject(text)

  if (lower.includes('مذاكرة') || lower.includes('تركيز') || lower.includes('جلسة') || lower.includes('focus') || lower.includes('مؤقت')) {
    const route = subject ? `/focus?subject=${subject.id}` : '/focus'
    return {
      type: 'NAVIGATE',
      route,
      label: subject ? `الانتقال لغرفة التركيز (${subject.name})` : 'الانتقال لغرفة التركيز',
    }
  }

  if (lower.includes('وسام') || lower.includes('أوسمة') || lower.includes('اوسمة') || lower.includes('رتبة') || lower.includes('مستوى') || lower.includes('xp')) {
    return {
      type: 'NAVIGATE',
      route: '/rpg',
      label: 'الانتقال لصفحة الأوسمة والرتبة',
    }
  }

  if (lower.includes('شجرة المنهج') || lower.includes('منهج') || lower.includes('فهرس')) {
    const route = subject ? `/curriculum/${subject.id}` : '/curriculum'
    return {
      type: 'NAVIGATE',
      route,
      label: subject ? `عرض منهج ${subject.name}` : 'عرض المنهج الدراسي',
    }
  }

  if (lower.includes('واجب') || lower.includes('مهام') || lower.includes('تراكم') || lower.includes('امتحان')) {
    return {
      type: 'NAVIGATE',
      route: '/tasks',
      label: 'الانتقال لصفحة المهام والواجبات',
    }
  }

  return null
}

function formatContext(report: any, subject?: { id: number; name: string } | null): string {
  if (!report || !report.subjects || !report.subjects.length) return ''

  if (subject) {
    const s = report.subjects.find((sub: any) => sub.subject_id === subject.id) || report.subjects[0]
    return `
[بيانات مادة ${s.subject_name || subject.name} الحقيقية من قاعدة بيانات Supabase]:
- إجمالي الدروس: ${s.total_topics}
- الدروس المتقنة: ${s.mastered_topics}
- قيد المراجعة: ${s.total_topics - s.mastered_topics - s.not_started}
- لم تبدأ بعد: ${s.not_started}
- نسبة الإتقان الكلية: ${Math.round(s.mastery_pct ?? 0)}%
`
  }

  const lines = report.subjects.map(
    (s: any) =>
      `- ${s.subject_name}: ${s.mastered_topics}/${s.total_topics} متقن (${Math.round(s.mastery_pct ?? 0)}%)`
  )

  return `
[بيانات المنهج العام من قاعدة بيانات Supabase]:
نسبة الإتقان العامة: ${Math.round(report.overall_mastery_pct ?? 0)}%
${lines.join('\n')}
`
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ reply: 'من فضلك اكتب رسالة واضحة.' }, { status: 400 })
    }

    const detectedSubject = detectSubject(message)

    // 1. Check if user wants to directly update database mastery
    const dbUpdateAction = await handleDatabaseMasteryUpdate(message)

    // 2. Check if user wants to automatically add a task/assignment/exam
    const taskAction = !dbUpdateAction ? await handleDatabaseTaskCreation(message) : null

    // 3. Check if user wants navigation action
    const navAction = !dbUpdateAction && !taskAction ? detectIntentAction(message) : null
    const action = dbUpdateAction || taskAction || navAction

    // 4. Fetch realtime mastery report
    const masteryReport = await getMasteryReport(detectedSubject?.id)
    const contextPrompt = formatContext(masteryReport, detectedSubject)

    // Append database update or task creation confirmation if executed
    let systemInjection = contextPrompt
    if (dbUpdateAction && dbUpdateAction.label) {
      systemInjection = `${contextPrompt}\n\n[إشعار النظام الداخلي]: تم تنفيذ طلب الطالب وتحديث قاعدة البيانات بنجاح: ${dbUpdateAction.label}. أكد ذلك للطالب بأسلوب إيجابي ومباشر مع ذكر اسم الدرس والمستوى الجديد.`
    } else if (taskAction && taskAction.task) {
      systemInjection = `${contextPrompt}\n\n[إشعار النظام الداخلي]: تم بنجاح إنشاء وإضافة المهمة في قاعدة البيانات (جدول: ${taskAction.task.table}): "${taskAction.task.title}" بتاريخ ${taskAction.task.dueDate}. أكد ذلك للطالب بأسلوب عملي ومشجع باللهجة المصرية وأخبره أنها مسجلة في جدول المهام.`
    }

    // Build Gemini history
    const contents = [
      ...history.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      {
        role: 'user',
        parts: [{ text: systemInjection ? `${systemInjection}\n\nسؤال الطالب: ${message}` : message }],
      },
    ]

    // Format model name safely
    const cleanModelName = GEMINI_MODEL.startsWith('models/') ? GEMINI_MODEL : `models/${GEMINI_MODEL}`
    const candidateModels = [
      cleanModelName,
      'models/gemini-3-flash-preview',
      'models/gemini-flash-lite-latest',
      'models/gemini-flash-latest'
    ]
    // Deduplicate
    const modelsToTry = Array.from(new Set(candidateModels))

    let geminiData: any = null
    let lastError = ''

    for (const modelToCall of modelsToTry) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${modelToCall}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents,
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 2500,
              },
            }),
          }
        )

        if (geminiRes.ok) {
          geminiData = await geminiRes.json()
          break
        } else {
          lastError = await geminiRes.text()
          console.error(`Gemini model ${modelToCall} failed:`, lastError)
        }
      } catch (err: any) {
        lastError = err?.message || String(err)
        console.error(`Gemini request to ${modelToCall} threw error:`, lastError)
      }
    }

    if (!geminiData) {
      console.error('All Gemini candidate models failed. Last error:', lastError)
      return NextResponse.json({
        reply: dbUpdateAction
          ? `✅ ${dbUpdateAction.label} (تم الحفظ في قاعدة البيانات).`
          : taskAction
          ? `✅ ${taskAction.label} (تمت الإضافة لجدول المهام).`
          : 'عذراً، حدث خطأ مؤقت في الاتصال بالذكاء الاصطناعي. جرب مرة أخرى.',
        action,
      })
    }
    const reply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (dbUpdateAction ? `✅ ${dbUpdateAction.label}` : taskAction ? `✅ ${taskAction.label}` : 'تم استلام طلبك.')

    return NextResponse.json({
      reply,
      action,
    })
  } catch (err: any) {
    console.error('API Chat Error:', err)
    return NextResponse.json({ reply: 'حدث خطأ غير متوقع أثناء معالجة الطلب.' }, { status: 500 })
  }
}
