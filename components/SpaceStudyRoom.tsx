'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Compass,
  ArrowRight,
  Sparkles,
  Camera,
  MapPin,
  Radio,
  Award,
  Zap,
  Globe2,
  X,
  Check,
  Flame,
  Rocket,
  BarChart2,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { soundscapeEngine } from '@/lib/soundscapes'
import { SubjectIcon } from '@/components/AcademicIcons'
import {
  SpaceStationWaypoint,
  SPACE_WAYPOINTS,
  getWaypointsBySubject,
} from '@/lib/spaceWaypoints'
import SpaceFlightEngine from './SpaceFlightEngine'

interface Props {
  running: boolean
  remaining: number
  totalSeconds: number
  mode: 'focus' | 'shortBreak' | 'longBreak'
  completedCycles: number
  subject: { id: number; name: string; icon: string }
  isFullscreen: boolean
  activeSessionId: number | null
  sessionLoading: boolean
  finished?: boolean
  earnedXp?: number | null
  sessionStats?: {
    streak?: number
    hours?: number
    message?: string
    rewards?: string[]
  } | null
  onToggleRunning: () => void
  onReset: () => void
  onSetPreset: (mins: number) => void
  onAddFiveMinutes: () => void
  onCompleteSession: () => void
  onToggleFullscreen: () => void
  onSelectSubject?: (id: number) => void
  onCloseCompletionModal?: () => void
}

export default function SpaceStudyRoom({
  running,
  remaining,
  totalSeconds,
  mode,
  completedCycles,
  subject,
  isFullscreen,
  activeSessionId,
  sessionLoading,
  finished = false,
  earnedXp = null,
  sessionStats = null,
  onToggleRunning,
  onReset,
  onSetPreset,
  onAddFiveMinutes,
  onCompleteSession,
  onToggleFullscreen,
  onSelectSubject,
  onCloseCompletionModal,
}: Props) {
  // Waypoint & Route State (defaults to first waypoint of current subject)
  const subjectWaypoints = getWaypointsBySubject(subject.id)
  const [currentWaypoint, setCurrentWaypoint] = useState<SpaceStationWaypoint>(
    subjectWaypoints[0] || SPACE_WAYPOINTS[0]
  )
  const [showWaypointMap, setShowWaypointMap] = useState(false)
  const [activeSectorFilter, setActiveSectorFilter] = useState<number>(subject.id)
  const [cameraView, setCameraView] = useState<'chase' | 'cockpit' | 'flyby'>('chase')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [engineVolume, setEngineVolume] = useState(0.4)

  // Sync waypoint when subject changes if current waypoint is from another subject
  useEffect(() => {
    const list = getWaypointsBySubject(subject.id)
    if (list.length > 0 && currentWaypoint.subjectId !== subject.id) {
      setCurrentWaypoint(list[0])
      setActiveSectorFilter(subject.id)
    }
  }, [subject.id, currentWaypoint.subjectId])

  // Soundscape Engine
  useEffect(() => {
    if (soundEnabled) {
      soundscapeEngine.setSpaceEngine(running ? engineVolume : engineVolume * 0.35)
    } else {
      soundscapeEngine.setSpaceEngine(0)
    }
  }, [soundEnabled, running, engineVolume])

  const toggleSound = () => {
    if (soundEnabled) {
      soundscapeEngine.setSpaceEngine(0)
      setSoundEnabled(false)
    } else {
      setSoundEnabled(true)
      soundscapeEngine.setSpaceEngine(running ? engineVolume : engineVolume * 0.35)
    }
  }

  // Formatting
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - remaining) / totalSeconds) * 100))
  const totalSegments = 18
  const activeSegments = Math.round((progressPercent / 100) * totalSegments)

  const toggleCamera = () => {
    const views: ('chase' | 'cockpit' | 'flyby')[] = ['chase', 'cockpit', 'flyby']
    const nextIdx = (views.indexOf(cameraView) + 1) % views.length
    setCameraView(views[nextIdx])
  }

  return (
    <div className="relative w-full h-full min-h-screen select-none overflow-hidden bg-black text-white font-mono">
      {/* ─── 1. Real 3D Hardware-Accelerated Space Flight Engine ────────────── */}
      <SpaceFlightEngine
        running={running}
        remaining={remaining}
        totalSeconds={totalSeconds}
        waypoint={currentWaypoint}
        cameraView={cameraView}
        onTogglePlay={onToggleRunning}
      />

      {/* ─── 2. Top-Left Holographic Navigation HUD ────────────────────────── */}
      <div
        className="absolute top-4 left-4 sm:top-6 sm:left-8 z-30 flex items-start gap-3"
        dir="ltr"
      >
        <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-xl bg-black/60 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-400 shadow-inner">
            <Globe2 size={20} className={running ? 'animate-spin' : ''} style={{ animationDuration: '16s' }} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                {currentWaypoint.code}
              </span>
              <span className="text-xs text-slate-400">{currentWaypoint.distanceLY} LY</span>
            </div>
            <span className="font-bold text-sm sm:text-base text-white tracking-wide">
              {currentWaypoint.nameAr}
            </span>
            <span className="text-[11px] text-cyan-400/90 tracking-wider">
              {currentWaypoint.celestialName}
            </span>
          </div>
        </div>

        {/* Back Link to Home */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/15 text-xs font-bold text-white transition-all shadow-lg active:scale-95"
          title="العودة للصفحة الرئيسية"
        >
          <ArrowRight size={14} className="rotate-180" />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </div>

      {/* ─── 3. Top-Right Mission Status & Waypoint Selector ───────────────── */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 flex items-center gap-2 sm:gap-2.5">
        {/* Warp Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#0A0B0E]/80 backdrop-blur-md border border-[rgba(236,238,242,0.12)] text-xs font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${
              running ? 'bg-[#4EA87E]' : 'bg-[#D4AF37]'
            }`}
          />
          <span className={running ? 'text-[#4EA87E]' : 'text-[#D4AF37]'}>
            {running ? 'WARP 4.5 ENGAGED' : 'ORBITAL DRIFT'}
          </span>
        </div>

        {/* 200+ Waypoint Star Chart Selector Button */}
        <button
          type="button"
          onClick={() => setShowWaypointMap(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#12141C]/90 hover:bg-[#191C25] backdrop-blur-md border border-[rgba(212,175,55,0.40)] text-xs font-semibold text-[#ECEEF2] transition-colors min-h-[40px]"
          title="عرض خريطة الـ 220 محطة فضائية واختيار مسار الرحلة"
        >
          <Compass size={15} className="text-[#D4AF37]" />
          <span>خريطة المحطات (220)</span>
        </button>

        {/* Camera Perspective Toggle */}
        <button
          type="button"
          onClick={toggleCamera}
          aria-label="تبديل زاوية الكاميرا"
          className="w-10 h-10 rounded-[10px] bg-[#0A0B0E]/80 hover:bg-[#191C25] backdrop-blur-md border border-[rgba(236,238,242,0.14)] text-[#ECEEF2] flex items-center justify-center transition-colors"
          title={`تبديل المنظور: ${cameraView === 'chase' ? 'خلف المركبة' : cameraView === 'cockpit' ? 'قمرة القيادة' : 'مداري'}`}
        >
          <Camera size={16} />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundEnabled ? 'كتم محرك الفضاء' : 'تشغيل محرك الفضاء'}
          className={`w-10 h-10 rounded-[10px] backdrop-blur-md border flex items-center justify-center transition-colors ${
            soundEnabled
              ? 'bg-[#191C25]/90 border-[rgba(212,175,55,0.45)] text-[#D4AF37]'
              : 'bg-[#0A0B0E]/80 border-[rgba(236,238,242,0.14)] text-[#7D8594] hover:text-[#ECEEF2]'
          }`}
          title={soundEnabled ? 'كتم محرك الفضاء' : 'تشغيل محرك الفضاء'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
          className="w-10 h-10 rounded-[10px] bg-[#0A0B0E]/80 hover:bg-[#191C25] backdrop-blur-md border border-[rgba(236,238,242,0.14)] text-[#ECEEF2] flex items-center justify-center transition-colors"
          title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* ─── 4. Center Top Sector Badge ───────────────────────────────────── */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0B0E]/80 backdrop-blur-md border border-[rgba(212,175,55,0.28)] text-xs font-semibold text-[#ECEEF2]">
          <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-[#4EA87E]' : 'bg-[#D4AF37]'}`} />
          <span className="text-[#D4AF37]">{currentWaypoint.sectorAr}</span>
          <span className="text-[#6B7280]">•</span>
          <span>{subject.name}</span>
        </span>
      </div>

      {/* ─── 5. Bottom Center Cockpit Telemetry, Timer & Hotbar ────────────── */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 w-full max-w-xl px-2">
        {/* Holographic Countdown Timer */}
        <button
          type="button"
          dir="ltr"
          onClick={onToggleRunning}
          aria-label={running ? 'إيقاف الرحلة مؤقتاً' : 'بدء الرحلة'}
          className="font-bold font-tabular text-5xl sm:text-7xl md:text-8xl text-[#ECEEF2] tracking-wider select-none hover:opacity-90 transition-opacity"
          style={{
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.85)',
          }}
          title={running ? 'انقر للإيقاف المؤقت' : 'انقر لبدء الرحلة'}
        >
          {`${mm}:${ss}`}
        </button>

        {/* ─── 18-Segment Warp Distance Charge Bar ─────────────────────────── */}
        <div className="w-full max-w-[340px] sm:max-w-[440px] flex items-center justify-between gap-1 p-1 rounded-[8px] bg-[#0A0B0E]/85 backdrop-blur-md border border-[rgba(236,238,242,0.14)]">
          {Array.from({ length: totalSegments }).map((_, idx) => {
            const isFilled = idx < activeSegments
            return (
              <div
                key={idx}
                className={`flex-1 h-2.5 sm:h-3 rounded-[2px] transition-colors duration-300 ${
                  isFilled ? 'bg-[#D4AF37]' : 'bg-[#191C25]'
                }`}
              />
            )
          })}
        </div>

        {/* ─── 9-Slot Mission Control Hotbar ────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-[12px] bg-[#0D0F15]/92 backdrop-blur-md border border-[rgba(236,238,242,0.14)] shadow-2xl">
          {/* Slot 1: Play/Pause */}
          <button
            type="button"
            onClick={onToggleRunning}
            aria-label={running ? 'إيقاف مؤقت' : 'بدء الرحلة'}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] border flex items-center justify-center font-bold transition-colors ${
              running
                ? 'bg-[#C88A36] border-[#C88A36] text-[#0A0B0E]'
                : 'bg-[#D4AF37] border-[#E0C058] text-[#0A0B0E]'
            }`}
            title={running ? 'إيقاف مؤقت' : 'بدء الرحلة'}
          >
            {running ? <Pause size={17} /> : <Play size={17} className="translate-x-0.5" />}
          </button>

          {/* Slot 2: 25 Min Preset */}
          <button
            type="button"
            onClick={() => onSetPreset(25)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] border flex items-center justify-center font-semibold text-xs font-tabular transition-colors ${
              totalSeconds === 25 * 60
                ? 'bg-[#191C25] text-[#D4AF37] border-[rgba(212,175,55,0.45)]'
                : 'bg-[#12141C] border-[rgba(236,238,242,0.10)] text-[#9CA3AF] hover:text-[#ECEEF2]'
            }`}
            title="25 دقيقة (رحلة قياسية)"
          >
            25د
          </button>

          {/* Slot 3: 45 Min Preset */}
          <button
            type="button"
            onClick={() => onSetPreset(45)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] border flex items-center justify-center font-semibold text-xs font-tabular transition-colors ${
              totalSeconds === 45 * 60
                ? 'bg-[#191C25] text-[#D4AF37] border-[rgba(212,175,55,0.45)]'
                : 'bg-[#12141C] border-[rgba(236,238,242,0.10)] text-[#9CA3AF] hover:text-[#ECEEF2]'
            }`}
            title="45 دقيقة (رحلة متقدمة)"
          >
            45د
          </button>

          {/* Slot 4: 60 Min Preset */}
          <button
            type="button"
            onClick={() => onSetPreset(60)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] border flex items-center justify-center font-semibold text-xs font-tabular transition-colors ${
              totalSeconds === 60 * 60
                ? 'bg-[#191C25] text-[#D4AF37] border-[rgba(212,175,55,0.45)]'
                : 'bg-[#12141C] border-[rgba(236,238,242,0.10)] text-[#9CA3AF] hover:text-[#ECEEF2]'
            }`}
            title="60 دقيقة (رحلة كونية عميقة)"
          >
            60د
          </button>

          {/* Slot 5: +5 Min */}
          <button
            type="button"
            onClick={onAddFiveMinutes}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] bg-[#12141C] hover:bg-[#191C25] border border-[rgba(236,238,242,0.10)] flex items-center justify-center font-semibold text-xs font-tabular text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            title="إضافة 5 دقائق لمسار الرحلة"
          >
            +5د
          </button>

          {/* Slot 6: Reset */}
          <button
            type="button"
            onClick={onReset}
            aria-label="إعادة ضبط المسار"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] bg-[#12141C] hover:bg-[#191C25] border border-[rgba(236,238,242,0.10)] flex items-center justify-center text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            title="إعادة ضبط المسار"
          >
            <RotateCcw size={15} />
          </button>

          {/* Slot 7: Audio Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label="طنين محرك الفضاء"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] border flex items-center justify-center transition-colors ${
              soundEnabled
                ? 'bg-[#191C25] border-[rgba(212,175,55,0.40)] text-[#D4AF37]'
                : 'bg-[#12141C] border-[rgba(236,238,242,0.10)] text-[#7D8594] hover:text-[#ECEEF2]'
            }`}
            title="طنين محرك الفضاء"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Slot 8: Camera Perspective */}
          <button
            type="button"
            onClick={toggleCamera}
            aria-label="تبديل زاوية الكاميرا"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] bg-[#12141C] hover:bg-[#191C25] border border-[rgba(236,238,242,0.10)] flex items-center justify-center text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            title="تبديل زاوية الكاميرا"
          >
            <Camera size={16} />
          </button>

          {/* Slot 9: Fullscreen */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] bg-[#12141C] hover:bg-[#191C25] border border-[rgba(236,238,242,0.10)] flex items-center justify-center text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* ─── 6. Database Flight End & XP Recording Button ────────────────── */}
        <button
          type="button"
          onClick={onCompleteSession}
          disabled={sessionLoading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-[10px] bg-[#D4AF37] hover:bg-[#E0C058] disabled:opacity-50 text-[#0A0B0E] font-semibold text-xs sm:text-sm shadow-xl transition-colors min-h-[44px]"
        >
          <CheckCircle2 size={17} />
          <span>
            {sessionLoading
              ? 'جاري حفظ بيانات الرحلة في قاعدة البيانات...'
              : 'إتمام الرحلة وتسجيل الاستكشاف والـ XP'}
          </span>
        </button>
      </div>

      {/* ─── 7. Interactive Galaxy Star Map & 200+ Waypoints Modal ─────────── */}
      <AnimatePresence>
        {showWaypointMap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(6,7,10,0.84)] backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label="خريطة المحطات الفضائية"
              className="w-full max-w-2xl max-h-[85vh] rounded-[16px] bg-[#191C25] border border-[rgba(236,238,242,0.14)] p-5 shadow-2xl flex flex-col text-[#ECEEF2]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(236,238,242,0.08)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-[rgba(212,175,55,0.10)] border border-[rgba(212,175,55,0.32)] flex items-center justify-center text-[#D4AF37]">
                    <Compass size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#ECEEF2]">
                      خريطة المحطات الفضائية (220 محطة)
                    </h3>
                    <p className="text-[11px] text-[#9CA3AF]">
                      اختر مسار رحلتك القادمة لكل مادة دراسية
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWaypointMap(false)}
                  aria-label="إغلاق خريطة المحطات"
                  className="w-9 h-9 rounded-[10px] bg-[#12141C] border border-[rgba(236,238,242,0.10)] text-[#9CA3AF] hover:text-[#ECEEF2] flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Sector Tabs */}
              <div className="flex items-center gap-2 py-3 overflow-x-auto border-b border-[rgba(236,238,242,0.07)]">
                {[
                  { id: 6, label: 'اللغة العربية (55)', sector: 'أوريون' },
                  { id: 9, label: 'التاريخ (55)', sector: 'كرونوس' },
                  { id: 8, label: 'الإنجليزية (55)', sector: 'قنطورس' },
                  { id: 7, label: 'البرمجة (55)', sector: 'أندروميدا' },
                ].map((sec) => (
                  <button
                    type="button"
                    key={sec.id}
                    onClick={() => {
                      setActiveSectorFilter(sec.id)
                      if (onSelectSubject) onSelectSubject(sec.id)
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-colors min-h-[38px] border ${
                      activeSectorFilter === sec.id
                        ? 'bg-[#12141C] border-[rgba(212,175,55,0.40)] text-[#ECEEF2]'
                        : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2]'
                    }`}
                  >
                    <SubjectIcon subjectId={sec.id} size={13} />
                    <span>{sec.label}</span>
                  </button>
                ))}
              </div>

              {/* Waypoints List */}
              <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
                {getWaypointsBySubject(activeSectorFilter).map((wp) => {
                  const isCurrent = wp.id === currentWaypoint.id
                  return (
                    <button
                      type="button"
                      key={wp.id}
                      onClick={() => {
                        setCurrentWaypoint(wp)
                        setShowWaypointMap(false)
                      }}
                      className={`w-full text-right flex items-center justify-between p-3 rounded-[10px] border transition-colors ${
                        isCurrent
                          ? 'bg-[#12141C] border-[rgba(212,175,55,0.45)]'
                          : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] hover:bg-[#12141C] hover:border-[rgba(236,238,242,0.18)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          dir="ltr"
                          className="w-9 h-9 rounded-[8px] bg-[#191C25] border border-[rgba(236,238,242,0.10)] flex items-center justify-center text-xs font-bold font-tabular text-[#D4AF37] shrink-0"
                        >
                          #{wp.id}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#ECEEF2] truncate">{wp.nameAr}</span>
                            <span
                              dir="ltr"
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[#191C25] text-[#9CA3AF] font-tabular"
                            >
                              {wp.code}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#7D8594]">{wp.celestialName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span dir="ltr" className="text-xs text-[#9CA3AF] font-tabular">{wp.distanceLY} LY</span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-xs font-semibold ${
                            isCurrent
                              ? 'bg-[#D4AF37] text-[#0A0B0E]'
                              : 'bg-[#191C25] text-[#ECEEF2] border border-[rgba(236,238,242,0.10)]'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <span>المسار الحالي</span>
                              <Check size={12} />
                            </>
                          ) : (
                            <>
                              <span>تعيين</span>
                              <ArrowLeft size={12} />
                            </>
                          )}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 8. Cosmic Victory & Docking Clearance Modal ──────────────────── */}
      <AnimatePresence>
        {finished && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(6,7,10,0.86)] backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.22 }}
              role="dialog"
              aria-modal="true"
              aria-label="اكتمال الرحلة"
              className="w-full max-w-md rounded-[16px] bg-[#191C25] border border-[rgba(212,175,55,0.40)] p-6 shadow-2xl text-center text-[#ECEEF2] flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-[14px] bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.38)] flex items-center justify-center text-[#D4AF37]">
                <Award size={30} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#ECEEF2]">
                  اكتملت الرحلة ورست المركبة بنجاح
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  تم تسجيل إحداثيات الاستكشاف وحفظ نقاط الـ XP في قاعدة البيانات.
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#07080B] border border-[rgba(212,175,55,0.28)] text-xs text-[#D4AF37]">
                  <MapPin size={13} />
                  <span>تم الرسو في: {currentWaypoint.nameAr}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="p-3 rounded-[10px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] flex flex-col items-center">
                  <span className="text-[11px] text-[#7D8594]">الـ XP المكتسب</span>
                  <span dir="ltr" className="text-base font-bold font-tabular text-[#4EA87E] mt-0.5">
                    +{earnedXp || Math.max(10, Math.round((totalSeconds / 60) * 1.5))} XP
                  </span>
                </div>

                <div className="p-3 rounded-[10px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] flex flex-col items-center">
                  <span className="text-[11px] text-[#7D8594]">مدة الرحلة</span>
                  <span className="text-base font-bold font-tabular text-[#ECEEF2] mt-0.5">
                    <span dir="ltr">{Math.round(totalSeconds / 60)}</span> د
                  </span>
                </div>

                <div className="p-3 rounded-[10px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] flex flex-col items-center">
                  <span className="text-[11px] text-[#7D8594]">التتابع</span>
                  <span className="text-base font-bold font-tabular text-[#C88A36] mt-0.5 flex items-center gap-1">
                    <Flame size={14} />
                    <span><span dir="ltr">{sessionStats?.streak || 2}</span> ي</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full mt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onCloseCompletionModal) onCloseCompletionModal()
                    onReset()
                  }}
                  className="flex-1 py-3 rounded-[10px] bg-[#D4AF37] hover:bg-[#E0C058] text-[#0A0B0E] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                >
                  <Rocket size={15} />
                  <span>رحلة جديدة</span>
                </button>

                <Link
                  href="/"
                  className="flex-1 py-3 rounded-[10px] bg-[#12141C] hover:bg-[#202430] text-[#ECEEF2] font-semibold text-xs border border-[rgba(236,238,242,0.14)] flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                >
                  <BarChart2 size={15} className="text-[#D4AF37]" />
                  <span>لوحة المتابعة</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
