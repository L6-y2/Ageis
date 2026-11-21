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
} from 'lucide-react'
import Link from 'next/link'
import { soundscapeEngine } from '@/lib/soundscapes'
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
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 flex items-center gap-2 sm:gap-3">
        {/* Warp Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/15 text-xs font-bold shadow-lg">
          <span
            className={`w-2 h-2 rounded-full ${
              running ? 'bg-cyan-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <span className={running ? 'text-cyan-300' : 'text-amber-300'}>
            {running ? 'WARP 4.5 ENGAGED' : 'ORBITAL DRIFT'}
          </span>
        </div>

        {/* 200+ Waypoint Star Chart Selector Button */}
        <button
          onClick={() => setShowWaypointMap(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600/60 to-blue-600/60 hover:from-cyan-500/70 hover:to-blue-500/70 backdrop-blur-xl border border-cyan-400/50 text-xs font-bold text-white transition-all active:scale-95 shadow-lg shadow-cyan-900/30"
          title="عرض خريطة الـ 200 محطة فضائية واختيار مسار الرحلة"
        >
          <Compass size={16} className="text-cyan-300" />
          <span>خريطة الـ 200 محطة 🪐</span>
        </button>

        {/* Camera Perspective Toggle */}
        <button
          onClick={toggleCamera}
          className="p-2 sm:p-2.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/15 text-cyan-300 hover:text-white transition-all active:scale-95 shadow-lg"
          title={`تبديل المنظور: ${cameraView === 'chase' ? 'خلف المركبة' : cameraView === 'cockpit' ? 'قمرة القيادة' : 'مداري'}`}
        >
          <Camera size={16} />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleSound}
          className={`p-2 sm:p-2.5 rounded-xl backdrop-blur-xl border transition-all active:scale-95 shadow-lg ${
            soundEnabled
              ? 'bg-cyan-600/60 border-cyan-400 text-white shadow-cyan-600/30'
              : 'bg-black/60 border-white/15 text-white/50 hover:text-white'
          }`}
          title={soundEnabled ? 'كتم محرك الفضاء' : 'تشغيل محرك الفضاء'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 sm:p-2.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/15 text-white transition-all active:scale-95 shadow-lg"
          title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* ─── 4. Center Top Sector Badge ───────────────────────────────────── */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/30 text-xs font-bold text-cyan-300 shadow-xl shadow-cyan-950/50">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{currentWaypoint.sectorAr}</span>
          <span className="text-white/40">•</span>
          <span className="text-white/80">{subject.name}</span>
        </span>
      </div>

      {/* ─── 5. Bottom Center Cockpit Telemetry, Timer & Hotbar ────────────── */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 w-full max-w-xl px-2">
        {/* Holographic Countdown Timer */}
        <div
          dir="ltr"
          onClick={onToggleRunning}
          className="font-bold text-5xl sm:text-7xl md:text-8xl text-white tracking-widest select-none cursor-pointer hover:scale-105 transition-transform"
          style={{
            textShadow:
              '0 0 20px rgba(56, 189, 248, 0.8), 0 0 40px rgba(6, 182, 212, 0.4), 2px 2px 0px #000',
          }}
          title={running ? 'انقر للإيقاف المؤقت' : 'انقر لبدء الرحلة'}
        >
          {`${mm}:${ss}`}
        </div>

        {/* ─── 18-Segment Warp Distance Charge Bar ─────────────────────────── */}
        <div className="w-full max-w-[340px] sm:max-w-[440px] flex items-center justify-between gap-1 p-1 rounded-md bg-black/80 backdrop-blur-md border border-cyan-500/40 shadow-2xl">
          {Array.from({ length: totalSegments }).map((_, idx) => {
            const isFilled = idx < activeSegments
            return (
              <div
                key={idx}
                className={`flex-1 h-3 sm:h-3.5 border-r border-black/90 transition-all duration-300 ${
                  isFilled
                    ? 'bg-gradient-to-t from-cyan-500 to-sky-300 shadow-[0_0_10px_#38bdf8]'
                    : 'bg-slate-900/70'
                }`}
              />
            )
          })}
        </div>

        {/* ─── 9-Slot Sci-Fi Mission Control Hotbar ────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/60">
          {/* Slot 1: Play/Pause */}
          <button
            onClick={onToggleRunning}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center font-bold transition-all active:scale-90 ${
              running
                ? 'bg-amber-600/80 border-amber-300 text-white shadow-md'
                : 'bg-slate-900 border-cyan-500/50 text-cyan-400 hover:bg-slate-800'
            }`}
            title={running ? 'إيقاف مؤقت' : 'بدء الرحلة'}
          >
            {running ? <Pause size={17} /> : <Play size={17} className="translate-x-0.5" />}
          </button>

          {/* Slot 2: 25 Min Preset */}
          <button
            onClick={() => onSetPreset(25)}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center font-bold text-xs transition-all active:scale-90 ${
              totalSeconds === 25 * 60
                ? 'bg-cyan-500 text-slate-950 border-white shadow-md font-black'
                : 'bg-slate-900 border-slate-700 text-white/90 hover:bg-slate-800'
            }`}
            title="25 دقيقة (رحلة قياسية)"
          >
            25د
          </button>

          {/* Slot 3: 45 Min Preset */}
          <button
            onClick={() => onSetPreset(45)}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center font-bold text-xs transition-all active:scale-90 ${
              totalSeconds === 45 * 60
                ? 'bg-cyan-500 text-slate-950 border-white shadow-md font-black'
                : 'bg-slate-900 border-slate-700 text-white/90 hover:bg-slate-800'
            }`}
            title="45 دقيقة (رحلة متقدمة)"
          >
            45د
          </button>

          {/* Slot 4: 60 Min Preset */}
          <button
            onClick={() => onSetPreset(60)}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center font-bold text-xs transition-all active:scale-90 ${
              totalSeconds === 60 * 60
                ? 'bg-cyan-500 text-slate-950 border-white shadow-md font-black'
                : 'bg-slate-900 border-slate-700 text-white/90 hover:bg-slate-800'
            }`}
            title="60 دقيقة (رحلة كونية عميقة)"
          >
            60د
          </button>

          {/* Slot 5: +5 Min */}
          <button
            onClick={onAddFiveMinutes}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white/90 transition-all active:scale-90"
            title="إضافة 5 دقائق لمسار الرحلة"
          >
            +5د
          </button>

          {/* Slot 6: Reset */}
          <button
            onClick={onReset}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-white/90 transition-all active:scale-90"
            title="إعادة ضبط المسار"
          >
            <RotateCcw size={15} />
          </button>

          {/* Slot 7: Audio Toggle */}
          <button
            onClick={toggleSound}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center transition-all active:scale-90 ${
              soundEnabled
                ? 'bg-cyan-700/80 border-cyan-300 text-cyan-200 shadow-md'
                : 'bg-slate-900 border-slate-700 text-white/60 hover:text-white'
            }`}
            title="طنين محرك الفضاء"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Slot 8: Camera Perspective */}
          <button
            onClick={toggleCamera}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-white/90 transition-all active:scale-90"
            title="تبديل زاوية الكاميرا"
          >
            <Camera size={16} />
          </button>

          {/* Slot 9: Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-white/90 transition-all active:scale-90"
            title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* ─── 6. Database Flight End & XP Recording Button ────────────────── */}
        <button
          onClick={onCompleteSession}
          disabled={sessionLoading}
          className="flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-cyan-900/60 border border-cyan-300/80 transition-all cursor-pointer"
          style={{
            textShadow: '0 0 10px rgba(6,182,212,0.8), 1px 1px 0px #000',
          }}
        >
          <CheckCircle2 size={18} className="text-white" />
          <span>
            {sessionLoading
              ? 'جاري حفظ بيانات الرحلة في قاعدة البيانات...'
              : '🛰️ إتمام الرحلة وتسجيل بيانات الاستكشاف والـ XP في السيرفر'}
          </span>
        </button>
      </div>

      {/* ─── 7. Interactive Galaxy Star Map & 200+ Waypoints Modal ─────────── */}
      <AnimatePresence>
        {showWaypointMap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-slate-950/95 border border-cyan-500/40 p-5 shadow-2xl flex flex-col text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass size={20} className="text-cyan-400" />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-cyan-300">
                      خريطة المحطات الفضائية ومسارات الرحلات (220 محطة)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      اختر مسار رحلتك القادمة لكل مادة ووحدة دراسية
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWaypointMap(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  ✕ إغلاق
                </button>
              </div>

              {/* Sector Tabs */}
              <div className="flex items-center gap-2 py-3 overflow-x-auto border-b border-slate-800/80">
                {[
                  { id: 6, label: '📖 اللغة العربية (55 محطة)', sector: 'أوريون' },
                  { id: 9, label: '🏛️ التاريخ (55 محطة)', sector: 'كرونوس' },
                  { id: 8, label: '🌍 الإنجليزية (55 محطة)', sector: 'قنطورس' },
                  { id: 7, label: '💻 البرمجة (55 محطة)', sector: 'أندروميدا' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSectorFilter(sec.id)
                      if (onSelectSubject) onSelectSubject(sec.id)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeSectorFilter === sec.id
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* Waypoints List */}
              <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
                {getWaypointsBySubject(activeSectorFilter).map((wp) => {
                  const isCurrent = wp.id === currentWaypoint.id
                  return (
                    <div
                      key={wp.id}
                      onClick={() => {
                        setCurrentWaypoint(wp)
                        setShowWaypointMap(false)
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-950/50'
                          : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-300">
                          #{wp.id}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{wp.nameAr}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {wp.code}
                            </span>
                          </div>
                          <span className="text-[11px] text-cyan-400">{wp.celestialName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono">{wp.distanceLY} LY</span>
                        <button
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300'
                          }`}
                        >
                          {isCurrent ? 'المسار الحالي ✓' : 'تعيين المسار ➔'}
                        </button>
                      </div>
                    </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl bg-slate-950/95 border-2 border-cyan-400 p-6 shadow-2xl text-center text-white flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-500/30">
                <Award size={36} />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-cyan-300 tracking-wider">
                  🛰️ اكتملت الرحلة ورست المركبة بنجاح!
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  تم تسجيل إحداثيات الاستكشاف وحفظ نقاط الـ XP في قاعدة بيانات Supabase.
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-xs text-cyan-300">
                  <MapPin size={13} />
                  <span>تم الرسو في: {currentWaypoint.nameAr}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                  <span className="text-xs text-slate-400">الـ XP المكتسب</span>
                  <span className="text-base font-black text-emerald-400 mt-0.5">
                    +{earnedXp || Math.max(10, Math.round((totalSeconds / 60) * 1.5))} XP
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                  <span className="text-xs text-slate-400">مدة الرحلة</span>
                  <span className="text-base font-black text-cyan-400 mt-0.5">
                    {Math.round(totalSeconds / 60)} دقيقة
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                  <span className="text-xs text-slate-400">التتابع</span>
                  <span className="text-base font-black text-amber-400 mt-0.5 flex items-center gap-1">
                    <span>🔥</span>
                    <span>{sessionStats?.streak || 2} يوم</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    if (onCloseCompletionModal) onCloseCompletionModal()
                    onReset()
                  }}
                  className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 border border-cyan-400"
                >
                  🚀 رحلة جديدة
                </button>

                <Link
                  href="/"
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs transition-all border border-slate-700 text-center"
                >
                  📊 لوحة المتابعة
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
