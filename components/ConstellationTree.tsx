'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Star,
  Clock,
  BookOpen,
  Compass,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import type { SubjectMasteryData, TopicData } from '@/lib/types'
import { getSubjectTheme } from '@/components/AcademicIcons'

interface Props {
  subject: SubjectMasteryData
  subjectColor: string
  localTopics: Record<number, Partial<TopicData>>
  onSelectTopic: (topic: TopicData) => void
  searchQuery?: string
  activeFilter?: string
}

export default function ConstellationTree({
  subject,
  subjectColor,
  localTopics,
  onSelectTopic,
  searchQuery = '',
  activeFilter = 'all',
}: Props) {
  void subjectColor
  const theme = getSubjectTheme(subject.subject_id)
  const [activeClusterId, setActiveClusterId] = useState<number | 'all'>('all')
  const [showLegend, setShowLegend] = useState(false)

  const sortedChapters = useMemo(() => {
    if (!subject?.chapters) return []
    return [...subject.chapters].sort((a, b) => (a.chapter_num ?? 0) - (b.chapter_num ?? 0))
  }, [subject?.chapters])

  const allTopicsWithLocal = useMemo(() => {
    return sortedChapters.flatMap((c) =>
      c.topics.map((t) => ({
        ...t,
        chapter_id: c.chapter_id,
        chapter_name: c.chapter_name,
        mastery_level: localTopics[t.id]?.mastery_level ?? t.mastery_level,
        next_review: localTopics[t.id]?.next_review ?? t.next_review,
      }))
    )
  }, [sortedChapters, localTopics])

  const stats = useMemo(() => {
    const total = allTopicsWithLocal.length
    const mastered = allTopicsWithLocal.filter((t) => t.mastery_level >= 5).length
    const reviewing = allTopicsWithLocal.filter((t) => t.mastery_level === 4).length
    const learning = allTopicsWithLocal.filter((t) => t.mastery_level >= 1 && t.mastery_level < 4).length
    const unlit = allTopicsWithLocal.filter((t) => t.mastery_level === 0).length
    const pct = total ? Math.round((mastered / total) * 100) : 0

    let statusTitle = 'طور التكوّن'
    if (pct === 100) statusTitle = 'كوكبة مكتملة'
    else if (pct >= 75) statusTitle = 'مجرة ساطعة'
    else if (pct >= 50) statusTitle = 'كوكبة مشعة'
    else if (pct >= 25) statusTitle = 'كوكبة ناشئة'

    return { total, mastered, reviewing, learning, unlit, pct, statusTitle }
  }, [allTopicsWithLocal])

  return (
    <div className="relative rounded-[16px] overflow-hidden border border-[rgba(236,238,242,0.10)] bg-[#0A0B0E] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)]">
      {/* Subtle Starfield Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg className="w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="aegis-starfield" width="140" height="140" patternUnits="userSpaceOnUse">
              <circle cx="18" cy="24" r="0.8" fill="#ECEEF2" opacity="0.5" />
              <circle cx="92" cy="38" r="1.1" fill="#D4AF37" opacity="0.65" />
              <circle cx="48" cy="84" r="0.6" fill="#9CA3AF" opacity="0.45" />
              <circle cx="115" cy="108" r="0.9" fill="#D4AF37" opacity="0.5" />
              <circle cx="70" cy="122" r="0.7" fill="#ECEEF2" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#aegis-starfield)" />
        </svg>
      </div>

      {/* Observatory Header */}
      <div className="relative z-10 p-5 sm:p-6 border-b border-[rgba(236,238,242,0.08)] bg-[#12141C]/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[10px] bg-[#191C25] border border-[rgba(212,175,55,0.32)] flex items-center justify-center text-[#D4AF37] shrink-0">
              <Sparkles size={20} strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-[#ECEEF2]">
                  كوكبة {subject.subject_name} الفلكية
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-[6px] bg-[rgba(212,175,55,0.10)] text-[#D4AF37] border border-[rgba(212,175,55,0.28)]">
                  {stats.statusTitle}
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                إضاءة النجوم تمثل درجة إتقان كل درس في المنهج
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowLegend(!showLegend)}
              aria-expanded={showLegend}
              className="px-3.5 py-2 rounded-[10px] bg-[#191C25] border border-[rgba(236,238,242,0.12)] hover:border-[rgba(236,238,242,0.22)] text-xs font-semibold text-[#ECEEF2] flex items-center gap-1.5 transition-colors min-h-[40px]"
            >
              <Compass size={14} className="text-[#D4AF37]" />
              <span>دليل النجوم</span>
            </button>
            <div className="px-3.5 py-1.5 rounded-[10px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] text-center">
              <span dir="ltr" className="block text-base font-bold text-[#D4AF37] font-tabular leading-none">
                {stats.pct}%
              </span>
              <span className="block text-[10px] text-[#7D8594] mt-1 font-medium">الإضاءة</span>
            </div>
          </div>
        </div>

        {/* Luminosity Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>
              <span dir="ltr" className="font-tabular text-[#ECEEF2] font-semibold">{stats.mastered}</span> نجم متقن من أصل{' '}
              <span dir="ltr" className="font-tabular text-[#ECEEF2]">{stats.total}</span>
            </span>
            <span className="font-tabular text-[11px] text-[#7D8594]">
              {stats.pct === 100 ? 'اكتملت الكوكبة' : `${stats.total - stats.mastered} في الانتظار`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#07080B] border border-[rgba(236,238,242,0.07)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.pct}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="h-full xp-shimmer rounded-full"
            />
          </div>
        </div>

        {/* Collapsible Star Guide Legend */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-4 pt-4 border-t border-[rgba(236,238,242,0.07)]"
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="flex items-center gap-2 p-2.5 rounded-[8px] bg-[#07080B] border border-[rgba(236,238,242,0.07)]">
                  <span className="w-3 h-3 rounded-full bg-[#D4AF37] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#ECEEF2]">متقن تماماً</p>
                    <p className="text-[10px] text-[#7D8594]">مستوى 5</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-[8px] bg-[#07080B] border border-[rgba(236,238,242,0.07)]">
                  <span className="w-3 h-3 rounded-full bg-[#C88A36] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#ECEEF2]">تحت المراجعة</p>
                    <p className="text-[10px] text-[#7D8594]">مستوى 4</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-[8px] bg-[#07080B] border border-[rgba(236,238,242,0.07)]">
                  <span className="w-3 h-3 rounded-full bg-[#5D8AA8] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#ECEEF2]">تلخيص وحل</p>
                    <p className="text-[10px] text-[#7D8594]">مستوى 2–3</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-[8px] bg-[#07080B] border border-[rgba(236,238,242,0.07)]">
                  <span className="w-3 h-3 rounded-full bg-[#937CB8] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#ECEEF2]">تمت القراءة</p>
                    <p className="text-[10px] text-[#7D8594]">مستوى 1</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-[8px] bg-[#07080B] border border-[rgba(236,238,242,0.07)] col-span-2 sm:col-span-1">
                  <span className="w-3 h-3 rounded-full bg-[#2A303E] border border-[rgba(236,238,242,0.18)] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#ECEEF2]">لم يبدأ</p>
                    <p className="text-[10px] text-[#7D8594]">مستوى 0</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Star Cluster Quick Selector Tabs */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveClusterId('all')}
            className={`px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 min-h-[38px] border ${
              activeClusterId === 'all'
                ? 'bg-[rgba(212,175,55,0.12)] border-[rgba(212,175,55,0.38)] text-[#ECEEF2]'
                : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2]'
            }`}
          >
            <Compass size={13} className={activeClusterId === 'all' ? 'text-[#D4AF37]' : ''} />
            <span>كل العناقيد (<span dir="ltr" className="font-tabular">{sortedChapters.length}</span>)</span>
          </button>

          {sortedChapters.map((ch) => {
            const chMastered = ch.topics.filter(
              (t) => (localTopics[t.id]?.mastery_level ?? t.mastery_level) >= 5
            ).length
            const isCompleted = chMastered === ch.topics.length && ch.topics.length > 0
            const isSelected = activeClusterId === ch.chapter_id

            return (
              <button
                type="button"
                key={ch.chapter_id}
                onClick={() => setActiveClusterId(ch.chapter_id)}
                className={`px-3 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 min-h-[38px] border ${
                  isSelected
                    ? 'bg-[#191C25] border-[rgba(212,175,55,0.38)] text-[#ECEEF2]'
                    : isCompleted
                    ? 'bg-[rgba(78,168,126,0.08)] border-[rgba(78,168,126,0.28)] text-[#4EA87E]'
                    : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2]'
                }`}
              >
                <span>عنقود <span dir="ltr" className="font-tabular">{ch.chapter_num}</span></span>
                <span dir="ltr" className="text-[10px] font-tabular opacity-80">
                  ({chMastered}/{ch.topics.length})
                </span>
                {isCompleted && <CheckCircle2 size={12} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Constellation Graph & Winding Star Paths */}
      <div className="relative z-10 p-4 sm:p-8 space-y-12">
        {sortedChapters
          .filter((ch) => activeClusterId === 'all' || activeClusterId === ch.chapter_id)
          .map((chapter) => {
            const clusterTopics = [...chapter.topics].sort((a, b) => a.id - b.id)

            const filteredClusterTopics = clusterTopics.filter((t) => {
              const lvl = localTopics[t.id]?.mastery_level ?? t.mastery_level
              const matchesQuery = !searchQuery || t.topic.toLowerCase().includes(searchQuery.toLowerCase())
              if (!matchesQuery) return false
              if (activeFilter === 'mastered') return lvl >= 5
              if (activeFilter === 'reviewing') return lvl === 4
              if (activeFilter === 'read') return lvl >= 1 && lvl < 4
              if (activeFilter === 'not_started') return lvl === 0
              return true
            })

            if (filteredClusterTopics.length === 0 && (searchQuery || activeFilter !== 'all')) {
              return null
            }

            const masteredInCluster = clusterTopics.filter(
              (t) => (localTopics[t.id]?.mastery_level ?? t.mastery_level) >= 5
            ).length
            const isClusterFullyMastered =
              clusterTopics.length > 0 && masteredInCluster === clusterTopics.length
            const clusterPct = clusterTopics.length
              ? Math.round((masteredInCluster / clusterTopics.length) * 100)
              : 0

            return (
              <div key={chapter.chapter_id} className="relative">
                {/* Chapter Milestone Gateway */}
                <div className="relative mb-8 text-center max-w-lg mx-auto">
                  <div
                    className={`inline-flex items-center gap-3 px-5 py-3 rounded-[12px] border ${
                      isClusterFullyMastered
                        ? 'bg-[#12141C] border-[rgba(78,168,126,0.38)]'
                        : 'bg-[#12141C] border-[rgba(236,238,242,0.12)]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-[8px] flex items-center justify-center font-bold text-xs font-tabular ${
                        isClusterFullyMastered
                          ? 'bg-[rgba(78,168,126,0.15)] text-[#4EA87E] border border-[rgba(78,168,126,0.35)]'
                          : 'bg-[#191C25] text-[#D4AF37] border border-[rgba(212,175,55,0.30)]'
                      }`}
                    >
                      {isClusterFullyMastered ? <CheckCircle2 size={15} /> : chapter.chapter_num}
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold ${theme.text}`}>
                          العنقود <span dir="ltr" className="font-tabular">{chapter.chapter_num}</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#07080B] text-[#9CA3AF] font-tabular">
                          <span dir="ltr">{masteredInCluster}/{clusterTopics.length}</span>
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-[#ECEEF2]">{chapter.chapter_name}</h3>
                    </div>

                    <div className="mr-auto pr-3 border-r border-[rgba(236,238,242,0.08)]">
                      <span dir="ltr" className="text-xs font-bold font-tabular text-[#D4AF37]">
                        {clusterPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Winding Star Path */}
                <div className="relative max-w-md mx-auto space-y-5">
                  <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-px bg-[rgba(236,238,242,0.10)] pointer-events-none" />

                  {filteredClusterTopics.map((topic, idx) => {
                    const level = localTopics[topic.id]?.mastery_level ?? topic.mastery_level
                    const isMastered = level >= 5
                    const isReviewing = level === 4
                    const isLearning = level >= 1 && level < 4
                    const isLeft = idx % 2 === 0

                    return (
                      <div
                        key={topic.id}
                        className={`relative flex items-center gap-3 sm:gap-4 ${
                          isLeft ? 'flex-row' : 'flex-row-reverse'
                        }`}
                      >
                        {/* Celestial Star Orb */}
                        <div className="relative shrink-0 z-20">
                          <button
                            type="button"
                            onClick={() => onSelectTopic(topic)}
                            aria-label={`درس ${topic.topic}، المستوى ${level} من 5`}
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold transition-colors border ${
                              isMastered
                                ? 'bg-[#D4AF37] border-[#E0C058] text-[#0A0B0E]'
                                : isReviewing
                                ? 'bg-[#191C25] border-[#C88A36] text-[#C88A36]'
                                : isLearning
                                ? 'bg-[#191C25] border-[#5D8AA8] text-[#5D8AA8]'
                                : 'bg-[#12141C] border-[rgba(236,238,242,0.14)] text-[#7D8594] hover:text-[#ECEEF2]'
                            }`}
                          >
                            {isMastered ? (
                              <Star size={18} strokeWidth={2} className="fill-[#0A0B0E]" />
                            ) : isReviewing ? (
                              <Clock size={16} />
                            ) : isLearning ? (
                              <BookOpen size={16} />
                            ) : (
                              <span dir="ltr" className="text-xs font-tabular">{idx + 1}</span>
                            )}
                          </button>
                        </div>

                        {/* Star Info Card (Accessible Button) */}
                        <button
                          type="button"
                          onClick={() => onSelectTopic(topic)}
                          className={`flex-1 text-right p-3.5 rounded-[12px] transition-colors border relative z-10 ${
                            isMastered
                              ? 'bg-[#12141C] border-[rgba(212,175,55,0.34)] hover:bg-[#191C25]'
                              : isReviewing
                              ? 'bg-[#12141C] border-[rgba(200,138,54,0.34)] hover:bg-[#191C25]'
                              : isLearning
                              ? 'bg-[#12141C] border-[rgba(93,138,168,0.32)] hover:bg-[#191C25]'
                              : 'bg-[#12141C] border-[rgba(236,238,242,0.08)] hover:bg-[#191C25] hover:border-[rgba(236,238,242,0.18)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-tabular px-2 py-0.5 rounded-[6px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] text-[#9CA3AF]">
                              نجم <span dir="ltr">#{idx + 1}</span>
                            </span>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-[6px] font-tabular border ${
                                isMastered
                                  ? 'bg-[rgba(212,175,55,0.12)] text-[#D4AF37] border-[rgba(212,175,55,0.30)]'
                                  : isReviewing
                                  ? 'bg-[rgba(200,138,54,0.12)] text-[#C88A36] border-[rgba(200,138,54,0.30)]'
                                  : isLearning
                                  ? 'bg-[rgba(93,138,168,0.12)] text-[#5D8AA8] border-[rgba(93,138,168,0.30)]'
                                  : 'bg-[#07080B] text-[#7D8594] border-[rgba(236,238,242,0.07)]'
                              }`}
                            >
                              {isMastered
                                ? 'متقن 5/5'
                                : isReviewing
                                ? 'مراجعة 4/5'
                                : isLearning
                                ? `قيد التعلم ${level}/5`
                                : '0/5'}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-semibold text-[#ECEEF2] line-clamp-2">
                            {topic.topic}
                          </h4>

                          <div className="mt-2 pt-2 border-t border-[rgba(236,238,242,0.06)] flex items-center justify-between text-[11px] text-[#7D8594]">
                            <span className="flex items-center gap-1">
                              <Zap size={11} className="text-[#D4AF37]" />
                              <span>تحديث المرحلة</span>
                            </span>
                            {topic.next_review && (
                              <span className="text-[10px]">
                                {new Date(topic.next_review).toLocaleDateString('ar-EG', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>

      {/* Footer Observatory Signature */}
      <div className="relative z-10 p-4 text-center border-t border-[rgba(236,238,242,0.07)] bg-[#12141C] text-xs text-[#7D8594]">
        <p className="flex items-center justify-center gap-1.5">
          <Sparkles size={13} className="text-[#D4AF37]" />
          <span>كل جلسة مذاكرة وإتقان تضيء نجماً جديداً في خريطة المنهج</span>
        </p>
      </div>
    </div>
  )
}
