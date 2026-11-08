'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Star,
  CheckCircle2,
  Clock,
  BookOpen,
  Circle,
  Layers,
  Compass,
  ChevronDown,
  Check,
  FileText,
  Flame,
  Award,
  Zap,
} from 'lucide-react'
import type { SubjectMasteryData, ChapterData, TopicData } from '@/lib/types'

interface Props {
  subject: SubjectMasteryData
  subjectColor: string
  localTopics: Record<number, Partial<TopicData>>
  onSelectTopic: (topic: TopicData) => void
  searchQuery?: string
  activeFilter?: string
}

// Color palettes for constellation nebulae based on subject
const NEBULA_THEMES: Record<
  number,
  {
    gradient: string
    glowColor: string
    beamColor: string
    accentHex: string
    starGradient: string
  }
> = {
  // Arabic (Emerald/Teal)
  6: {
    gradient: 'from-emerald-500/20 via-teal-600/10 to-transparent',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    beamColor: '#10b981',
    accentHex: '#10b981',
    starGradient: 'from-emerald-300 via-teal-400 to-emerald-600',
  },
  // English (Purple/Violet)
  8: {
    gradient: 'from-purple-500/20 via-violet-600/10 to-transparent',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    beamColor: '#a855f7',
    accentHex: '#a855f7',
    starGradient: 'from-purple-300 via-violet-400 to-purple-600',
  },
  // History (Amber/Gold)
  9: {
    gradient: 'from-amber-500/20 via-orange-600/10 to-transparent',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    beamColor: '#f59e0b',
    accentHex: '#f59e0b',
    starGradient: 'from-amber-300 via-yellow-400 to-amber-600',
  },
  // Programming (Blue/Cyan)
  7: {
    gradient: 'from-cyan-500/20 via-blue-600/10 to-transparent',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    beamColor: '#06b6d4',
    accentHex: '#06b6d4',
    starGradient: 'from-cyan-300 via-sky-400 to-blue-600',
  },
}

export default function ConstellationTree({
  subject,
  subjectColor,
  localTopics,
  onSelectTopic,
  searchQuery = '',
  activeFilter = 'all',
}: Props) {
  const theme = NEBULA_THEMES[subject.subject_id] || NEBULA_THEMES[6]
  const [activeClusterId, setActiveClusterId] = useState<number | 'all'>('all')
  const [showLegend, setShowLegend] = useState(false)

  // Sort chapters cleanly by chapter_num
  const sortedChapters = useMemo(() => {
    if (!subject?.chapters) return []
    return [...subject.chapters].sort((a, b) => (a.chapter_num ?? 0) - (b.chapter_num ?? 0))
  }, [subject?.chapters])

  // Flattened topics with up-to-date local stages
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

  // Constellation luminosity stats
  const stats = useMemo(() => {
    const total = allTopicsWithLocal.length
    const mastered = allTopicsWithLocal.filter((t) => t.mastery_level >= 5).length
    const reviewing = allTopicsWithLocal.filter((t) => t.mastery_level === 4).length
    const learning = allTopicsWithLocal.filter((t) => t.mastery_level >= 1 && t.mastery_level < 4).length
    const unlit = allTopicsWithLocal.filter((t) => t.mastery_level === 0).length
    const pct = total ? Math.round((mastered / total) * 100) : 0

    let statusTitle = 'سديم في طور التكوّن 🪐'
    if (pct === 100) statusTitle = 'كوكبة مكتملة أسطورية 👑'
    else if (pct >= 75) statusTitle = 'مجرة ساطعة متوهجة ✨'
    else if (pct >= 50) statusTitle = 'كوكبة مشعة 🌟'
    else if (pct >= 25) statusTitle = 'كوكبة ناشئة 🔭'

    return { total, mastered, reviewing, learning, unlit, pct, statusTitle }
  }, [allTopicsWithLocal])

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800/90 bg-[#070b16] shadow-2xl">
      {/* ─── Deep Space Ambient Cosmic Background ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cosmic Nebula Glow */}
        <div
          className={`absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br ${theme.gradient} rounded-full blur-3xl opacity-60`}
        />
        <div
          className={`absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-tr ${theme.gradient} rounded-full blur-3xl opacity-40`}
        />
        <div
          className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: theme.glowColor }}
        />

        {/* CSS Twinkling Celestial Starfield Pattern */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/0 via-slate-900/50 to-black">
          <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="starfield" width="120" height="120" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="20" r="0.8" fill="#ffffff" opacity="0.6" />
                <circle cx="85" cy="35" r="1.2" fill="#ffffff" opacity="0.8" />
                <circle cx="45" cy="75" r="0.6" fill="#a5b4fc" opacity="0.5" />
                <circle cx="105" cy="95" r="1" fill="#fef08a" opacity="0.7" />
                <circle cx="65" cy="110" r="0.7" fill="#ffffff" opacity="0.4" />
                <circle cx="30" cy="90" r="1.4" fill="#38bdf8" opacity="0.9" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#starfield)" />
          </svg>
        </div>
      </div>

      {/* ─── Cosmic Header & Constellation Overview ───────────────────── */}
      <div className="relative z-10 p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-400/30 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              🌌
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  كوكبة {subject.subject_name} الفلكية
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {stats.statusTitle}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                توهج النجوم يمثل مستوى إتقانك لكل درس وتكليف في المنهج
              </p>
            </div>
          </div>

          {/* Luminosity percentage pill */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <Compass size={13} className="text-indigo-400" />
              <span>دليل النجوم</span>
            </button>
            <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-center shadow-lg">
              <span className="block text-base sm:text-lg font-black text-amber-300 font-mono tracking-tight leading-none">
                {`${stats.pct}%`}
              </span>
              <span className="text-[9px] text-slate-400 font-bold">توهج الكوكبة</span>
            </div>
          </div>
        </div>

        {/* Luminosity Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              <span>{`${stats.mastered} نجماً ساطعاً من أصل ${stats.total}`}</span>
            </span>
            <span className="text-slate-500 font-mono">
              {stats.pct === 100 ? 'تم اكتمال السماء بالكامل ✨' : `${stats.total - stats.mastered} نجم في الانتظار`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-amber-300 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.8)]"
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
              className="overflow-hidden mt-3 pt-3 border-t border-slate-800/80"
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 shadow-[0_0_8px_#facc15] inline-block" />
                  <div>
                    <p className="font-bold text-slate-200">متقن تماماً</p>
                    <p className="text-[9px] text-slate-400">مستوى 5 (سوبرنوفا)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_#f97316] inline-block" />
                  <div>
                    <p className="font-bold text-slate-200">تحت المراجعة</p>
                    <p className="text-[9px] text-slate-400">مستوى 4 (نجم مشتعل)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 shadow-[0_0_8px_#38bdf8] inline-block" />
                  <div>
                    <p className="font-bold text-slate-200">تم التلخيص والحل</p>
                    <p className="text-[9px] text-slate-400">مستوى 2-3 (نجم أزرق)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 shadow-[0_0_8px_#a855f7] inline-block" />
                  <div>
                    <p className="font-bold text-slate-200">تمت القراءة</p>
                    <p className="text-[9px] text-slate-400">مستوى 1 (استيقاظ)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-700 border border-slate-600 inline-block" />
                  <div>
                    <p className="font-bold text-slate-200">لم يبدأ</p>
                    <p className="text-[9px] text-slate-400">مستوى 0 (نجم خامد)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Star Cluster Quick Selector Tabs ───────────────────────── */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveClusterId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeClusterId === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Compass size={13} />
            <span>عرض كل العناقيد ({sortedChapters.length})</span>
          </button>

          {sortedChapters.map((ch) => {
            const chMastered = ch.topics.filter(
              (t) => (localTopics[t.id]?.mastery_level ?? t.mastery_level) >= 5
            ).length
            const isCompleted = chMastered === ch.topics.length && ch.topics.length > 0
            const isSelected = activeClusterId === ch.chapter_id

            return (
              <button
                key={ch.chapter_id}
                onClick={() => setActiveClusterId(ch.chapter_id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{`عنقود ${ch.chapter_num}`}</span>
                <span className="text-[10px] font-mono opacity-80">{`(${chMastered}/${ch.topics.length})`}</span>
                {isCompleted && <span className="text-[10px]">✨</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Main Constellation Graph & Winding Star Paths ────────────── */}
      <div className="relative z-10 p-4 sm:p-8 space-y-12">
        {sortedChapters
          .filter((ch) => activeClusterId === 'all' || activeClusterId === ch.chapter_id)
          .map((chapter) => {
            // Sort topics in textbook order
            const clusterTopics = [...chapter.topics].sort((a, b) => a.id - b.id)

            // Filter topics if search or filter query active
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
                {/* ── Chapter Milestone Gateway / Galaxy Node ── */}
                <div className="relative mb-8 text-center max-w-lg mx-auto">
                  <div
                    className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-xl border transition-all shadow-xl ${
                      isClusterFullyMastered
                        ? 'bg-emerald-950/70 border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-900/90 border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        isClusterFullyMastered
                          ? 'bg-emerald-400 text-slate-950 shadow-[0_0_12px_#34d399]'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isClusterFullyMastered ? '✨' : chapter.chapter_num}
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                          {`العنقود النجمي ${chapter.chapter_num}`}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-400">
                          {`${masteredInCluster}/${clusterTopics.length} نجم متوهج`}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-black text-white">{chapter.chapter_name}</h3>
                    </div>

                    <div className="mr-auto pr-2 pl-1 border-r border-slate-800">
                      <span className="text-xs font-black font-mono text-amber-300">{`${clusterPct}%`}</span>
                    </div>
                  </div>
                </div>

                {/* ── Winding Star Path (Cosmic Node Network) ── */}
                <div className="relative max-w-md mx-auto space-y-6">
                  {/* Vertical Neon Conduit / Line Behind Nodes */}
                  <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-0.5 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-b from-indigo-500/20 via-slate-700/30 to-indigo-500/20" />
                  </div>

                  {filteredClusterTopics.map((topic, idx) => {
                    const level = localTopics[topic.id]?.mastery_level ?? topic.mastery_level
                    const isMastered = level >= 5
                    const isReviewing = level === 4
                    const isLearning = level >= 1 && level < 4
                    const isUnlit = level === 0

                    // Alternating cosmic orbits: Left (idx % 2 === 0) vs Right (idx % 2 === 1)
                    const isLeft = idx % 2 === 0

                    return (
                      <div
                        key={topic.id}
                        className={`relative flex items-center gap-3 sm:gap-4 ${
                          isLeft ? 'flex-row' : 'flex-row-reverse text-left'
                        }`}
                      >
                        {/* 🌟 1. Celestial Star Orb (Interactive Button) */}
                        <div className="relative flex-shrink-0 z-20 mx-auto sm:mx-0">
                          <button
                            onClick={() => onSelectTopic(topic)}
                            className="group relative flex items-center justify-center focus:outline-none transition-transform active:scale-95"
                            title={`درس: ${topic.topic} (مستوى ${level})`}
                          >
                            {/* Outer Glow Halo for Mastered Stars */}
                            {isMastered && (
                              <motion.div
                                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                className="absolute -inset-2.5 rounded-full blur-md"
                                style={{ backgroundColor: theme.glowColor }}
                              />
                            )}

                            {/* Rotating celestial ring for reviewing stars */}
                            {isReviewing && (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                                className="absolute -inset-1.5 rounded-full border border-dashed border-amber-400/80"
                              />
                            )}

                            {/* Core Star Orb */}
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-all shadow-xl relative z-10 ${
                                isMastered
                                  ? 'bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 text-slate-950 shadow-[0_0_20px_#facc15] ring-2 ring-white/60'
                                  : isReviewing
                                  ? 'bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 text-white shadow-[0_0_15px_#f97316] ring-1 ring-amber-300/40'
                                  : isLearning
                                  ? 'bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-400 text-white shadow-[0_0_12px_#38bdf8] ring-1 ring-cyan-300/40'
                                  : 'bg-slate-900 border border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {/* 4-point Diamond Star Flare for Mastered */}
                              {isMastered ? (
                                <Star size={20} className="fill-slate-950 text-slate-950 animate-pulse" />
                              ) : isReviewing ? (
                                <Clock size={18} className="text-white" />
                              ) : isLearning ? (
                                <BookOpen size={18} className="text-white" />
                              ) : (
                                <span className="text-xs font-mono font-bold">{idx + 1}</span>
                              )}
                            </div>

                            {/* Level 5 Supernova Rays */}
                            {isMastered && (
                              <span className="absolute -top-1 -right-1 text-xs">✨</span>
                            )}
                          </button>
                        </div>

                        {/* 📝 2. Floating Star Info Capsule / Card */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          onClick={() => onSelectTopic(topic)}
                          className={`flex-1 p-3.5 rounded-2xl cursor-pointer transition-all border backdrop-blur-md relative z-10 ${
                            isMastered
                              ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-950/90 border-emerald-500/40 hover:border-emerald-400/70 shadow-lg'
                              : isReviewing
                              ? 'bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-slate-950/90 border-amber-500/40 hover:border-amber-400/70 shadow-lg'
                              : isLearning
                              ? 'bg-gradient-to-r from-sky-950/60 via-slate-900/80 to-slate-950/90 border-sky-500/30 hover:border-sky-400/60'
                              : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700/80 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-slate-400">
                              {`نجم #${idx + 1}`}
                            </span>

                            {/* Status Pill */}
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                                isMastered
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : isReviewing
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : isLearning
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isMastered
                                ? 'متقن تماماً (5/5)'
                                : isReviewing
                                ? 'تحت المراجعة (4/5)'
                                : isLearning
                                ? `قيد التعلم (${level}/5)`
                                : 'خامد لم يبدأ (0/5)'}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-black text-slate-100 line-clamp-2">
                            {topic.topic}
                          </h4>

                          {/* Action prompt */}
                          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 hover:text-indigo-300 transition-colors">
                              <Zap size={11} className="text-amber-400" />
                              <span>انقر لإشعال النجم أو المراجعة</span>
                            </span>
                            {topic.next_review && (
                              <span className="font-mono text-[9px] text-slate-500">
                                {`مراجعة: ${new Date(topic.next_review).toLocaleDateString('ar-EG', {
                                  month: 'short',
                                  day: 'numeric',
                                })}`}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>

      {/* ─── Footer Galaxy Signature ──────────────────────────────────── */}
      <div className="relative z-10 p-4 text-center border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-500 font-mono">
        <p className="flex items-center justify-center gap-1.5">
          <Sparkles size={13} className="text-amber-400" />
          <span>كل جلسة مذاكرة في غرفة التركيز تشعل نجمة جديدة في سماء إيجيس</span>
        </p>
      </div>
    </div>
  )
}
