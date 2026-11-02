'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Bot,
  User,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Database,
  CheckSquare,
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center ${
                  msg.role === 'assistant'
                    ? 'border border-emerald-500/40 shadow-sm bg-[#0e1217]'
                    : 'border border-slate-700/80 bg-slate-800'
                }`}
              >
                <img
                  src={msg.role === 'assistant' ? aegisAvatar : userAvatar}
                  alt={msg.role === 'assistant' ? 'Aegis' : 'User'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bubble & Action Card */}
              <div className="flex flex-col gap-2 max-w-[82%]">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'assistant'
                      ? 'panel text-slate-200 border border-slate-700/60 shadow-sm'
                      : 'bg-emerald-600 text-white shadow-md'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Agentic Navigation Chip */}
                {msg.action && msg.action.type === 'NAVIGATE' && msg.action.route && (
                  <motion.button
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => router.push(msg.action!.route!)}
                    className="flex items-center gap-2 self-start px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
                  >
                    <ExternalLink size={14} />
                    <span>{msg.action.label}</span>
                  </motion.button>
                )}

                {/* Agentic Realtime Database Sync Chip */}
                {msg.action && msg.action.type === 'DATABASE_UPDATED' && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 self-start px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-medium shadow-sm"
                  >
                    <Database size={13} className="text-emerald-400 shrink-0" />
                    <span>{msg.action.label || `تم تحديث قاعدة البيانات: ${msg.action.newLabel}`}</span>
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 ml-1" />
                  </motion.div>
                )}

                {/* Agentic Automatic Task Creation Chip */}
                {msg.action && msg.action.type === 'TASK_CREATED' && (
                  <motion.button
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => router.push(msg.action?.route || '/tasks')}
                    className="flex items-center gap-2 self-start px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-md hover:bg-emerald-500/25 active:scale-95 transition-all"
                  >
                    <CheckSquare size={14} className="text-emerald-400 shrink-0" />
                    <span>{msg.action.label || 'تمت إضافة المهمة بنجاح'}</span>
                    <span className="text-[10px] text-emerald-400/90 underline font-normal mr-1.5">عرض في جدول المهام ➔</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-9 h-9 rounded-2xl overflow-hidden flex-shrink-0 border border-emerald-500/40 bg-[#0e1217]">
              <img src={aegisAvatar} alt="Aegis" className="w-full h-full object-cover" />
            </div>
            <div className="panel rounded-2xl px-4 py-3 flex items-center gap-2 border border-slate-700/60">
              <Loader2 size={16} className="text-emerald-400 animate-spin" />
              <span className="text-sm text-slate-400">إيجيس يحلل وينفذ...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-800/80 bg-[#141922] flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="اسأل إيجيس، اطلب تعديل مستوى درس، أو ضيف واجب ومهمة جديدة..."
          className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
          dir="auto"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl flex items-center justify-center text-white transition-all shadow-md active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
