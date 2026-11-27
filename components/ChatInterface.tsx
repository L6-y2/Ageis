'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Database,
  CheckSquare,
  ArrowLeft,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAvatars } from '@/lib/useAvatars'

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

interface Message {
  role: 'user' | 'assistant'
  content: string
  action?: ActionPayload | null
}

export default function ChatInterface() {
  const router = useRouter()
  const { userAvatar, aegisAvatar } = useAvatars()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'أهلاً بك! أنا "إيجيس"، مساعدك الدراسي الذكي. تقدر تسألني عن دروسك، تطلب تغيير مستوى أي درس، تسجل مهمة أو واجب جديد، أو تطلب بدء جلسة تركيز.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      })

      if (!res.ok) throw new Error('فشل الاتصال')

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          action: data.action || null,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'تعذر الاتصال بالخادم، يرجى المحاولة بعد قليل.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        <div className="max-w-4xl mx-auto space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-[10px] shrink-0 overflow-hidden flex items-center justify-center border ${
                    msg.role === 'assistant'
                      ? 'border-[rgba(212,175,55,0.38)] bg-[#07080B]'
                      : 'border-[rgba(236,238,242,0.14)] bg-[#191C25]'
                  }`}
                >
                  <img
                    src={msg.role === 'assistant' ? aegisAvatar : userAvatar}
                    alt={msg.role === 'assistant' ? 'Aegis' : 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bubble & Action Card */}
                <div className="flex flex-col gap-2 max-w-[84%] sm:max-w-[75%]">
                  <div
                    className={`rounded-[12px] px-4 py-3 text-[15px] leading-[1.65] whitespace-pre-wrap border ${
                      msg.role === 'assistant'
                        ? 'bg-[#12141C] text-[#ECEEF2] border-[rgba(236,238,242,0.08)] border-r-2 border-r-[#D4AF37]'
                        : 'bg-[#191C25] text-[#ECEEF2] border-[rgba(236,238,242,0.14)]'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Agentic Navigation Chip */}
                  {msg.action && msg.action.type === 'NAVIGATE' && msg.action.route && (
                    <button
                      type="button"
                      onClick={() => router.push(msg.action!.route!)}
                      className="flex items-center gap-2 self-start px-3.5 py-2 rounded-[10px] bg-[#D4AF37] hover:bg-[#E0C058] text-[#0A0B0E] text-xs font-semibold transition-colors min-h-[40px]"
                    >
                      <ExternalLink size={14} />
                      <span>{msg.action.label}</span>
                    </button>
                  )}

                  {/* Agentic Realtime Database Sync Chip */}
                  {msg.action && msg.action.type === 'DATABASE_UPDATED' && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex items-center gap-2 self-start px-3.5 py-2 rounded-[10px] bg-[rgba(78,168,126,0.10)] border border-[rgba(78,168,126,0.32)] text-[#4EA87E] text-xs font-semibold"
                    >
                      <Database size={13} className="shrink-0" />
                      <span>{msg.action.label || `تم تحديث قاعدة البيانات: ${msg.action.newLabel}`}</span>
                      <CheckCircle2 size={14} className="shrink-0" />
                    </div>
                  )}

                  {/* Agentic Automatic Task Creation Chip */}
                  {msg.action && msg.action.type === 'TASK_CREATED' && (
                    <button
                      type="button"
                      onClick={() => router.push(msg.action?.route || '/tasks')}
                      className="flex items-center gap-2 self-start px-3.5 py-2.5 rounded-[10px] bg-[rgba(78,168,126,0.10)] hover:bg-[rgba(78,168,126,0.18)] border border-[rgba(78,168,126,0.32)] text-[#4EA87E] text-xs font-semibold transition-colors min-h-[40px]"
                    >
                      <CheckSquare size={14} className="shrink-0" />
                      <span>{msg.action.label || 'تمت إضافة المهمة بنجاح'}</span>
                      <span className="text-[11px] text-[#ECEEF2] inline-flex items-center gap-1 mr-1">
                        <span>عرض في المهام</span>
                        <ArrowLeft size={12} />
                      </span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div role="status" aria-live="polite" className="flex gap-3">
              <div className="w-9 h-9 rounded-[10px] overflow-hidden shrink-0 border border-[rgba(212,175,55,0.38)] bg-[#07080B]">
                <img src={aegisAvatar} alt="Aegis" className="w-full h-full object-cover" />
              </div>
              <div className="bg-[#12141C] rounded-[12px] px-4 py-3 flex items-center gap-2.5 border border-[rgba(236,238,242,0.08)]">
                <Loader2 size={15} className="text-[#D4AF37] animate-spin" />
                <span className="text-xs text-[#9CA3AF]">إيجيس يحلل وينفذ...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Composer Dock */}
      <div className="border-t border-[rgba(236,238,242,0.08)] bg-[#0D0F15] px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex gap-2.5 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="اسأل إيجيس، اطلب تعديل مستوى درس، أو ضيف مهمة جديدة..."
            aria-label="رسالة إلى إيجيس"
            className="flex-1 bg-[#07080B] border border-[rgba(236,238,242,0.12)] rounded-[10px] px-4 h-11 text-sm text-[#ECEEF2] placeholder-[#6B7280] focus:border-[#D4AF37] transition-colors"
            dir="auto"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="إرسال الرسالة"
            className="w-11 h-11 bg-[#D4AF37] hover:bg-[#E0C058] disabled:bg-[#191C25] disabled:text-[#6B7280] disabled:border disabled:border-[rgba(236,238,242,0.08)] rounded-[10px] flex items-center justify-center text-[#0A0B0E] transition-colors shrink-0"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
