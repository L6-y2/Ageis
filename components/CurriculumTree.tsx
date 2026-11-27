'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  BookOpen,
  Clock,
  Search,
  Calendar,
  X,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  Loader2,
  FileText,
  Layers,
  RotateCcw,
} from 'lucide-react'
import type { RpcMasteryReport, ChapterData, TopicData } from '@/lib/types'
import ConstellationTree from '@/components/ConstellationTree'
import { getSubjectTheme } from '@/components/AcademicIcons'

interface Props {
  report: RpcMasteryReport
  subjectColor: string
}

type FilterStatus = 'all' | 'mastered' | 'reviewing' | 'read' | 'not_started'

export default function CurriculumTree({ report, subjectColor }: Props) {
  const subject = report?.subjects?.[0]
  const [viewMode, setViewMode] = useState<'list' | 'constellation'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null)
  const [activeModalTab, setActiveModalTab] = useState<'stages' | 'sm2'>('stages')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localTopics, setLocalTopics] = useState<Record<number, Partial<TopicData>>>({})

  // Restore preferred view mode (list or constellation)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aegis_curriculum_view_mode')
      if (saved === 'list' || saved === 'constellation') {
        setViewMode(saved)
      }
    } catch {}
  }, [])

  const handleToggleViewMode = (mode: 'list' | 'constellation') => {
    setViewMode(mode)
    try {
      localStorage.setItem('aegis_curriculum_view_mode', mode)
    } catch {}
  }

  // Flattened topics for counters
  const allTopics = useMemo(() => {
    if (!subject?.chapters) return []
    return subject.chapters.flatMap((c) => c.topics)
  }, [subject])

  const counts = useMemo(() => {
    let mastered = 0
    let reviewing = 0
    let read = 0
    let not_started = 0
    allTopics.forEach((t) => {
      const level = localTopics[t.id]?.mastery_level ?? t.mastery_level
      if (level >= 5) mastered++
      else if (level === 4) reviewing++
      else if (level >= 1) read++
      else not_started++
    })
    return { all: allTopics.length, mastered, reviewing, read, not_started }
  }, [allTopics, localTopics])

  if (!subject?.chapters?.length) {
    return (
      <div className="aegis-panel p-12 text-center text-[#7D8594]">
        <BookOpen size={36} strokeWidth={1.5} className="mx-auto text-[#6B7280] mb-3" />
        <p className="text-sm font-semibold text-[#9CA3AF]">لا توجد دروس متاحة حالياً لهذه المادة</p>
      </div>
    )
  }

  // 1. Direct Stage Update
  const handleSetStage = async (topicId: number, level: number) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, masteryLevel: level }),
      })
      const data = await res.json()
      if (data.success) {
        if (level === 5) {
          try {
            const confetti = (await import('canvas-confetti')).default
            confetti({
              particleCount: 80,
              spread: 65,
              origin: { y: 0.6 },
              colors: ['#D4AF37', '#4EA87E', '#ECEEF2', '#C88A36'],
            })
          } catch {}
        }

        setLocalTopics((prev) => ({
          ...prev,
          [topicId]: {
            mastery_level: level,
          },
        }))
      }
      setSelectedTopic(null)
    } catch (e) {
      console.error('Update stage error:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2. SM-2 Rating Update
  const handleRateTopic = async (topicId: number, grade: number) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, grade }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        if (grade >= 4) {
          try {
            const confetti = (await import('canvas-confetti')).default
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#D4AF37', '#4EA87E', '#ECEEF2'],
            })
          } catch {}
        }

        setLocalTopics((prev) => ({
          ...prev,
          [topicId]: {
            mastery_level: grade >= 5 ? 5 : grade >= 4 ? 4 : grade >= 2 ? 2 : 1,
            next_review: data.data.next_review_date || new Date().toISOString(),
          },
        }))
      }
      setSelectedTopic(null)
    } catch (e) {
      console.error('Rate topic error:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const subjectTheme = getSubjectTheme(subject.subject_id)

  return (
    <div className="space-y-4">
      {/* ─── View Switcher Segmented Bar ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-[12px] bg-[#12141C] border border-[rgba(236,238,242,0.08)]">
        <div className="flex items-center gap-1.5 p-0.5 rounded-[10px] bg-[#07080B] border border-[rgba(236,238,242,0.06)]">
          <button
            type="button"
            onClick={() => handleToggleViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-xs font-semibold transition-colors min-h-[38px] ${
              viewMode === 'list'
                ? 'bg-[#191C25] text-[#ECEEF2] border border-[rgba(212,175,55,0.32)]'
                : 'text-[#9CA3AF] hover:text-[#ECEEF2] border border-transparent'
            }`}
          >
            <Layers size={14} className={viewMode === 'list' ? 'text-[#D4AF37]' : ''} />
            <span>قائمة الفصول</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleViewMode('constellation')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-xs font-semibold transition-colors min-h-[38px] ${
              viewMode === 'constellation'
                ? 'bg-[#191C25] text-[#ECEEF2] border border-[rgba(212,175,55,0.32)]'
                : 'text-[#9CA3AF] hover:text-[#ECEEF2] border border-transparent'
            }`}
          >
            <Sparkles size={14} className={viewMode === 'constellation' ? 'text-[#D4AF37]' : ''} />
            <span>الخريطة الفلكية</span>
          </button>
        </div>

        <span className="text-[11px] font-medium text-[#7D8594] px-2.5">
          {viewMode === 'constellation' ? 'تمثيل فلكي لمستويات الإتقان' : 'التسلسل المنهجي حسب الكتاب'}
        </span>
      </div>

      {/* ─── Search & Status Filters ──────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7D8594] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أي درس أو مفهوم في المنهج..."
            aria-label="بحث في دروس المادة"
            className="w-full bg-[#07080B] border border-[rgba(236,238,242,0.12)] rounded-[10px] pr-10 pl-10 h-11 text-sm text-[#ECEEF2] placeholder-[#6B7280] focus:border-[#D4AF37] transition-colors"
            dir="auto"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="مسح البحث"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[8px] flex items-center justify-center text-[#7D8594] hover:text-[#ECEEF2]"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap min-h-[40px] border ${
              activeFilter === 'all'
                ? 'bg-[rgba(212,175,55,0.12)] border-[rgba(212,175,55,0.38)] text-[#ECEEF2]'
                : 'bg-[#12141C] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2]'
            }`}
          >
            الكل (<span dir="ltr" className="font-tabular">{counts.all}</span>)
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('mastered')}
            className={`px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 min-h-[40px] border ${
              activeFilter === 'mastered'
                ? 'bg-[rgba(78,168,126,0.14)] border-[rgba(78,168,126,0.40)] text-[#4EA87E]'
                : 'bg-[#12141C] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#4EA87E]'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>متقن (<span dir="ltr" className="font-tabular">{counts.mastered}</span>)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('reviewing')}
            className={`px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 min-h-[40px] border ${
              activeFilter === 'reviewing'
                ? 'bg-[rgba(200,138,54,0.14)] border-[rgba(200,138,54,0.40)] text-[#C88A36]'
                : 'bg-[#12141C] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#C88A36]'
            }`}
          >
            <Clock size={13} />
            <span>تحت المراجعة (<span dir="ltr" className="font-tabular">{counts.reviewing}</span>)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('read')}
            className={`px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 min-h-[40px] border ${
              activeFilter === 'read'
                ? 'bg-[rgba(93,138,168,0.14)] border-[rgba(93,138,168,0.40)] text-[#5D8AA8]'
                : 'bg-[#12141C] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#5D8AA8]'
            }`}
          >
            <BookOpen size={13} />
            <span>القراءة والتلخيص (<span dir="ltr" className="font-tabular">{counts.read}</span>)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('not_started')}
            className={`px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 min-h-[40px] border ${
              activeFilter === 'not_started'
                ? 'bg-[#191C25] border-[rgba(236,238,242,0.28)] text-[#ECEEF2]'
                : 'bg-[#12141C] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2]'
            }`}
          >
            <Circle size={12} />
            <span>لم يبدأ (<span dir="ltr" className="font-tabular">{counts.not_started}</span>)</span>
          </button>
        </div>
      </div>

      {/* ─── Constellation View Mode vs Chapters List ─────────────────── */}
      {viewMode === 'constellation' ? (
        <ConstellationTree
          subject={subject}
          subjectColor={subjectColor}
          localTopics={localTopics}
          onSelectTopic={(t) => setSelectedTopic(t)}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
        />
      ) : (
        <div className="space-y-4">
          {[...subject.chapters]
            .sort((a, b) => (a.chapter_num ?? 0) - (b.chapter_num ?? 0))
            .map((chapter) => {
              const sortedChapterTopics = [...chapter.topics].sort((a, b) => a.id - b.id)
              const filteredTopics = sortedChapterTopics.filter((t) => {
                const level = localTopics[t.id]?.mastery_level ?? t.mastery_level
                const matchesQuery = !searchQuery || t.topic.toLowerCase().includes(searchQuery.toLowerCase())

                if (!matchesQuery) return false
                if (activeFilter === 'mastered') return level >= 5
                if (activeFilter === 'reviewing') return level === 4
                if (activeFilter === 'read') return level >= 1 && level < 4
                if (activeFilter === 'not_started') return level === 0
                return true
              })

              if (filteredTopics.length === 0 && (searchQuery || activeFilter !== 'all')) {
                return null
              }

              return (
                <ChapterBlock
                  key={chapter.chapter_id}
                  chapter={chapter}
                  topics={filteredTopics}
                  theme={subjectTheme}
                  localTopics={localTopics}
                  onSelectTopic={(t) => setSelectedTopic(t)}
                />
              )
            })}
        </div>
      )}

      {/* ─── Topic Mastery Stage & SM-2 Modal ──────────────────────────────── */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[rgba(6,7,10,0.82)] backdrop-blur-md">
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="topic-modal-title"
              className="w-full max-w-lg bg-[#191C25] border border-[rgba(236,238,242,0.14)] rounded-t-[18px] sm:rounded-[16px] p-5 sm:p-6 shadow-[0_20px_48px_-8px_rgba(0,0,0,0.8)] relative"
            >
              {/* Mobile Sheet Handle */}
              <div className="sm:hidden w-10 h-1 rounded-full bg-[rgba(236,238,242,0.18)] mx-auto mb-3" />

              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-[rgba(236,238,242,0.08)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-[10px] bg-[rgba(212,175,55,0.10)] border border-[rgba(212,175,55,0.3)] text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Sparkles size={17} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-[#7D8594] font-medium block">تحديث حالة الدرس</span>
                    <h3 id="topic-modal-title" className="text-sm sm:text-base font-bold text-[#ECEEF2] truncate">
                      {selectedTopic.topic}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  aria-label="إغلاق النافذة"
                  className="w-9 h-9 rounded-[10px] bg-[#12141C] border border-[rgba(236,238,242,0.10)] text-[#9CA3AF] hover:text-[#ECEEF2] flex items-center justify-center shrink-0 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#07080B] border border-[rgba(236,238,242,0.07)] rounded-[10px] my-4">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('stages')}
                  className={`py-2 px-2 rounded-[8px] text-xs font-semibold transition-colors min-h-[38px] ${
                    activeModalTab === 'stages'
                      ? 'bg-[#191C25] text-[#ECEEF2] border border-[rgba(212,175,55,0.32)]'
                      : 'text-[#9CA3AF] hover:text-[#ECEEF2] border border-transparent'
                  }`}
                >
                  المراحل الدراسية الخمسة
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('sm2')}
                  className={`py-2 px-2 rounded-[8px] text-xs font-semibold transition-colors min-h-[38px] ${
                    activeModalTab === 'sm2'
                      ? 'bg-[#191C25] text-[#ECEEF2] border border-[rgba(212,175,55,0.32)]'
                      : 'text-[#9CA3AF] hover:text-[#ECEEF2] border border-transparent'
                  }`}
                >
                  تقييم التكرار الذكي (SM-2)
                </button>
              </div>

              {/* TAB 1: 5 Direct Mastery Stages */}
              {activeModalTab === 'stages' && (
                <div className="space-y-2">
                  <p className="text-xs text-[#9CA3AF] mb-2.5">
                    اختر مرحلة الاستيعاب الحالية لتحديث نسبة الإتقان في المنهج:
                  </p>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSetStage(selectedTopic.id, 5)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(78,168,126,0.10)] hover:bg-[rgba(78,168,126,0.16)] border border-[rgba(78,168,126,0.30)] text-[#4EA87E] font-semibold text-xs transition-colors min-h-[46px]"
                  >
                    <span className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} />
                      <span>متقن تماماً (المستوى 5)</span>
                    </span>
                    <span dir="ltr" className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[rgba(78,168,126,0.15)] font-tabular">
                      100%
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSetStage(selectedTopic.id, 4)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(200,138,54,0.10)] hover:bg-[rgba(200,138,54,0.16)] border border-[rgba(200,138,54,0.30)] text-[#C88A36] font-semibold text-xs transition-colors min-h-[46px]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Clock size={16} />
                      <span>تحت المراجعة (المستوى 4)</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[rgba(200,138,54,0.15)]">
                      جاهز للاختبار
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSetStage(selectedTopic.id, 2)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(93,138,168,0.10)] hover:bg-[rgba(93,138,168,0.16)] border border-[rgba(93,138,168,0.30)] text-[#5D8AA8] font-semibold text-xs transition-colors min-h-[46px]"
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText size={16} />
                      <span>تم التلخيص وحل التمارين (المستوى 2)</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[rgba(93,138,168,0.15)]">
                      تطبيق عملي
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSetStage(selectedTopic.id, 1)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(147,124,184,0.10)] hover:bg-[rgba(147,124,184,0.16)] border border-[rgba(147,124,184,0.30)] text-[#937CB8] font-semibold text-xs transition-colors min-h-[46px]"
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen size={16} />
                      <span>تمت القراءة والفهم الأولي (المستوى 1)</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[rgba(147,124,184,0.15)]">
                      مقدمة
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSetStage(selectedTopic.id, 0)}
                    className="w-full flex items-center justify-between p-3 rounded-[10px] bg-[#12141C] hover:bg-[#202430] border border-[rgba(236,238,242,0.10)] text-[#9CA3AF] font-semibold text-xs transition-colors min-h-[44px]"
                  >
                    <span className="flex items-center gap-2.5">
                      <RotateCcw size={14} />
                      <span>لم يبدأ بعد (المستوى 0)</span>
                    </span>
                    <span className="text-[11px] text-[#7D8594]">إعادة ضبط</span>
                  </button>
                </div>
              )}

              {/* TAB 2: SM-2 Algorithm Rating */}
              {activeModalTab === 'sm2' && (
                <div className="space-y-2">
                  <p className="text-xs text-[#9CA3AF] mb-2.5 leading-relaxed">
                    قيّم مدى استرجاعك للدرس لحساب موعد المراجعة القادم وفق خوارزمية SM-2:
                  </p>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleRateTopic(selectedTopic.id, 5)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(78,168,126,0.10)] hover:bg-[rgba(78,168,126,0.16)] border border-[rgba(78,168,126,0.30)] text-[#4EA87E] font-semibold text-xs transition-colors min-h-[46px]"
                  >
                    <span className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} />
                      <span>متقن وسهل جداً (درجة 5)</span>
                    </span>
                    <span className="text-[11px] font-tabular">+XP ممتد</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleRateTopic(selectedTopic.id, 4)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(93,138,168,0.10)] hover:bg-[rgba(93,138,168,0.16)] border border-[rgba(93,138,168,0.30)] text-[#5D8AA8] font-semibold text-xs transition-colors min-h-[46px]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Check size={16} />
                      <span>فهم جيد مع تردد بسيط (درجة 4)</span>
                    </span>
                    <span className="text-[11px]">مراجعة عادية</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleRateTopic(selectedTopic.id, 3)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(200,138,54,0.10)] hover:bg-[rgba(200,138,54,0.16)] border border-[rgba(200,138,54,0.30)] text-[#C88A36] font-semibold text-xs transition-colors min-h-[46px]"
                  >
                    <span className="flex items-center gap-2.5">
                      <AlertCircle size={16} />
                      <span>صحيح ولكن بصعوبة (درجة 3)</span>
                    </span>
                    <span className="text-[11px]">مراجعة قريبة</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleRateTopic(selectedTopic.id, 1)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(201,91,102,0.10)] hover:bg-[rgba(201,91,102,0.16)] border border-[rgba(201,91,102,0.30)] text-[#E58992] font-semibold text-xs transition-colors min-h-[46px]"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle size={16} />
                      <span>نسيان تام أو خطأ (درجة 1)</span>
                    </span>
                    <span className="text-[11px]">إعادة غداً</span>
                  </button>
                </div>
              )}

              {isSubmitting && (
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute inset-0 bg-[#0A0B0E]/85 rounded-t-[18px] sm:rounded-[16px] flex items-center justify-center gap-2.5 text-[#D4AF37] text-xs font-semibold"
                >
                  <Loader2 size={18} className="animate-spin" />
                  <span>جاري تحديث قاعدة البيانات...</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChapterBlock({
  chapter,
  topics,
  theme,
  localTopics,
  onSelectTopic,
}: {
  chapter: ChapterData
  topics: TopicData[]
  theme: ReturnType<typeof getSubjectTheme>
  localTopics: Record<number, Partial<TopicData>>
  onSelectTopic: (topic: TopicData) => void
}) {
  const [open, setOpen] = useState(true)

  const masteredCount = topics.filter((t) => {
    const lvl = localTopics[t.id]?.mastery_level ?? t.mastery_level
    return lvl >= 4
  }).length

  const chapterPct = topics.length ? Math.round((masteredCount / topics.length) * 100) : 0

  return (
    <section className="aegis-panel overflow-hidden">
      {/* Chapter Milestone Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-right transition-colors hover:bg-[#191C25]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-10 h-10 rounded-[10px] ${theme.bgSubtle} border ${theme.border} flex items-center justify-center shrink-0`}>
            <BookOpen size={18} strokeWidth={1.75} className={theme.text} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-[#7D8594]">
                الفصل <span dir="ltr" className="font-tabular">{chapter.chapter_num}</span>
              </span>
              <span className="text-[10px] font-tabular px-2 py-0.5 rounded-[6px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] text-[#9CA3AF]">
                <span dir="ltr">{masteredCount}/{topics.length}</span> متقن
              </span>
            </div>
            <h2 className="font-semibold text-[#ECEEF2] text-sm sm:text-base mt-0.5 truncate">
              {chapter.chapter_name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span dir="ltr" className="text-xs font-bold text-[#ECEEF2] font-tabular">
            {chapterPct}%
          </span>
          <div className="w-8 h-8 rounded-[8px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] flex items-center justify-center text-[#9CA3AF]">
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Topics Editorial Index */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-[rgba(236,238,242,0.07)]"
          >
            <div className="divide-y divide-[rgba(236,238,242,0.06)]">
              {topics.map((t, index) => {
                const currentLevel = localTopics[t.id]?.mastery_level ?? t.mastery_level
                const nextReview = localTopics[t.id]?.next_review ?? t.next_review

                return (
                  <TopicNode
                    key={t.id}
                    topic={t}
                    level={currentLevel}
                    nextReview={nextReview}
                    index={index + 1}
                    onOpenRate={() => onSelectTopic(t)}
                  />
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function TopicNode({
  topic,
  level,
  nextReview,
  index,
  onOpenRate,
}: {
  topic: TopicData
  level: number
  nextReview: string | null
  index: number
  onOpenRate: () => void
}) {
  void index

  const getStageConfig = (lvl: number) => {
    if (lvl >= 5) {
      return {
        label: 'متقن تماماً',
        badgeClass: 'bg-[rgba(78,168,126,0.12)] text-[#4EA87E] border-[rgba(78,168,126,0.30)]',
        icon: CheckCircle2,
        iconColor: 'text-[#4EA87E]',
      }
    }
    if (lvl === 4) {
      return {
        label: 'تحت المراجعة',
        badgeClass: 'bg-[rgba(200,138,54,0.12)] text-[#C88A36] border-[rgba(200,138,54,0.30)]',
        icon: Clock,
        iconColor: 'text-[#C88A36]',
      }
    }
    if (lvl === 2 || lvl === 3) {
      return {
        label: 'تم التلخيص',
        badgeClass: 'bg-[rgba(93,138,168,0.12)] text-[#5D8AA8] border-[rgba(93,138,168,0.30)]',
        icon: FileText,
        iconColor: 'text-[#5D8AA8]',
      }
    }
    if (lvl === 1) {
      return {
        label: 'تمت القراءة',
        badgeClass: 'bg-[rgba(147,124,184,0.12)] text-[#937CB8] border-[rgba(147,124,184,0.30)]',
        icon: BookOpen,
        iconColor: 'text-[#937CB8]',
      }
    }
    return {
      label: 'لم يبدأ',
      badgeClass: 'bg-[#07080B] text-[#7D8594] border-[rgba(236,238,242,0.08)]',
      icon: Circle,
      iconColor: 'text-[#6B7280]',
    }
  }

  const currentStage = getStageConfig(level)
  const Icon = currentStage.icon

  return (
    <button
      type="button"
      onClick={onOpenRate}
      className="w-full text-right px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#191C25] transition-colors group min-h-[56px]"
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-[8px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] group-hover:border-[rgba(212,175,55,0.32)] flex items-center justify-center shrink-0 transition-colors">
          <Icon size={15} strokeWidth={1.75} className={currentStage.iconColor} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#ECEEF2] text-sm truncate group-hover:text-white">
            {topic.topic}
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <span className="text-[11px] text-[#7D8594] font-tabular">
              وزن <span dir="ltr">{topic.weight || 1}</span>
            </span>
            {nextReview && level > 0 && (
              <span className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                <Calendar size={11} className="text-[#D4AF37]" />
                <span>
                  {new Date(nextReview).toLocaleDateString('ar-EG', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <span
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-[8px] border shrink-0 ${currentStage.badgeClass}`}
      >
        {currentStage.label}
      </span>
    </button>
  )
}
