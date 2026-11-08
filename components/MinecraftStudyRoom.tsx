'use client'

import { useState, useEffect, useRef } from 'react'
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
  Flame,
  CloudRain,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { soundscapeEngine } from '@/lib/soundscapes'
import { SUBJECTS } from '@/lib/types'

// ─── 3D Isometric Jukebox Wireframe Block SVG (Exact from Minecraft Video Screenshot) ───
function MinecraftJukeboxWireframe() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 48 48"
      fill="none"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
    >
      {/* Top Diamond Face */}
      <polygon points="24,5 42,14 24,23 6,14" fill="rgba(255,255,255,0.06)" />
      {/* Left Face */}
      <polygon points="6,14 24,23 24,42 6,33" fill="rgba(0,0,0,0.25)" />
      {/* Right Face */}
      <polygon points="24,23 42,14 42,33 24,42" fill="rgba(0,0,0,0.35)" />
      {/* Eighth Note inside front right face */}
      <path d="M29 33 V22 L37 20 V25 M29 27 L37 25" stroke="white" strokeWidth="2.2" />
      <circle cx="27" cy="33" r="2.2" fill="white" stroke="none" />
    </svg>
  )
}

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
  onOpenMixer?: () => void
}

export default function MinecraftStudyRoom({
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
  onOpenMixer,
}: Props) {
  // Ambient Sound Toggles (Procedural Web Audio - 0 KB Internet Quota!)
  const [rainVolume, setRainVolume] = useState(0.4)
  const [fireVolume, setFireVolume] = useState(0.25)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSubjectPicker, setShowSubjectPicker] = useState(false)

  // Canvas for procedural rain drops falling on window
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Formatting
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - remaining) / totalSeconds) * 100))
  const currentPomodoroCycle = (completedCycles % 4) + 1

  // 18-segment Minecraft Progress Bar
  const totalSegments = 18
  const activeSegments = Math.round((progressPercent / 100) * totalSegments)

  // Initialize soundscapes on mount / user interaction
  useEffect(() => {
    if (soundEnabled) {
      soundscapeEngine.setRain(rainVolume)
      soundscapeEngine.setFire(fireVolume)
    } else {
      soundscapeEngine.setRain(0)
      soundscapeEngine.setFire(0)
    }
  }, [soundEnabled, rainVolume, fireVolume])

  // Rain Animation Canvas (GPU-accelerated, 0 KB Internet)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const drops: { x: number; y: number; length: number; speed: number; opacity: number }[] = []
    const numDrops = 65

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < numDrops; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 14 + Math.random() * 20,
        speed: 9 + Math.random() * 12,
        opacity: 0.2 + Math.random() * 0.45,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 1.4
      ctx.strokeStyle = '#cffafe'

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        ctx.beginPath()
        ctx.globalAlpha = d.opacity
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - 3, d.y + d.length)
        ctx.stroke()

        d.y += d.speed
        d.x -= 1.5
        if (d.y > canvas.height) {
          d.y = -20
          d.x = Math.random() * canvas.width
        }
      }
      animId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const toggleSound = () => {
    if (soundEnabled) {
      soundscapeEngine.stopAll()
      setSoundEnabled(false)
    } else {
      setSoundEnabled(true)
      soundscapeEngine.setRain(rainVolume)
      soundscapeEngine.setFire(fireVolume)
    }
  }

  return (
    <div
      className="relative w-full h-full min-h-screen select-none overflow-hidden bg-black text-white"
      style={{
        fontFamily: "'Silkscreen', 'Courier New', monospace",
      }}
    >
      {/* ─── 1. Ultra HD 4K Crisp Minecraft Rainy Cottage Artwork (0 KB Streaming) ─── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/minecraft-room-4k.jpg"
        alt="Minecraft Rainy Cottage 4K Background"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        style={{
          filter: 'brightness(0.96) contrast(1.02)',
        }}
      />

      {/* ─── 2. Local GPU-Accelerated Rain Streaks Canvas (0 KB Data!) ─────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
      />

      {/* ─── 3. Ambient Lantern & Fireplace Flickering Glow Overlay ───────── */}
      <motion.div
        animate={{ opacity: [0.35, 0.55, 0.4, 0.6, 0.35] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="absolute pointer-events-none z-10 rounded-full bg-amber-500/25 blur-3xl"
        style={{
          left: '18%',
          top: '20%',
          width: '260px',
          height: '260px',
        }}
      />

      {/* ─── 4. Top Left HUD: Beginning C418 & Navigation (Exact Screenshot) ─── */}
      <div
        className="absolute top-4 left-4 sm:top-6 sm:left-8 z-30 flex items-start gap-3"
        dir="ltr"
      >
        {/* Minecraft Music Box Wireframe & Title */}
        <div
          className="flex items-center gap-3 p-2 px-3 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 shadow-2xl"
          style={{
            textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
          }}
        >
          <MinecraftJukeboxWireframe />

          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base text-white tracking-widest leading-tight">
              Beginning
            </span>
            <span className="text-xs text-white/80 tracking-widest">C418</span>
          </div>
        </div>

        {/* Back Link to Home */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/20 text-xs font-bold text-white transition-all shadow-lg active:scale-95"
          title="العودة للصفحة الرئيسية"
        >
          <ArrowRight size={14} className="rotate-180" />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </div>

      {/* ─── 5. Top Right HUD: Pomodoro 1/4 & Controls (Exact Screenshot) ──── */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 flex items-center gap-2 sm:gap-3">
        {/* Pomodoro 1/4 Counter Badge */}
        <div
          className="px-4 py-2 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 font-bold text-sm sm:text-base text-white tracking-widest shadow-2xl"
          style={{
            textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
          }}
        >
          {`Pomodoro ${currentPomodoroCycle}/4`}
        </div>

        {/* Subject Switcher Button */}
        <button
          onClick={() => setShowSubjectPicker(!showSubjectPicker)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/20 text-xs font-bold text-white transition-all active:scale-95 shadow-lg"
          title="تغيير المادة الدراسية"
        >
          <span>{subject.icon}</span>
          <span className="hidden sm:inline">{subject.name}</span>
        </button>

        {/* Sound Toggle (Mute/Unmute Rain & Fire Soundscapes) */}
        <button
          onClick={toggleSound}
          className={`p-2 sm:p-2.5 rounded-xl backdrop-blur-md border transition-all active:scale-95 shadow-lg ${
            soundEnabled
              ? 'bg-emerald-600/70 border-emerald-400 text-white shadow-emerald-600/30'
              : 'bg-black/45 border-white/20 text-white/60 hover:text-white'
          }`}
          title={soundEnabled ? 'كتم أصوات المطر والمدفأة' : 'تشغيل أصوات المطر والمدفأة'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 sm:p-2.5 rounded-xl bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all active:scale-95 shadow-lg"
          title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* ─── 6. Center: Floating Subject Quick Status ─────────────────────── */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <span
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-300 shadow-xl"
          style={{
            textShadow: '1px 1px 0px #000',
          }}
        >
          <span>{subject.icon}</span>
          <span>{subject.name}</span>
          <span className="text-white/40">•</span>
          <span className="text-white/80">{running ? 'جلسة جارية' : 'متوقف مؤقتاً'}</span>
        </span>
      </div>

      {/* ─── 7. Bottom Center: Timer, Segmented Bar, Hotbar & XP Button ─────── */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2.5 sm:gap-3 w-full max-w-xl px-2">
        {/* Digital Countdown Timer (Exact White Font with Hard Black Drop Shadow) */}
        <div
          dir="ltr"
          className="font-bold text-5xl sm:text-7xl md:text-8xl text-white tracking-widest select-none cursor-pointer hover:scale-105 transition-transform"
          onClick={onToggleRunning}
          title={running ? 'انقر للإيقاف المؤقت' : 'انقر لبدء التركيز'}
          style={{
            textShadow:
              '3px 3px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 4px 14px rgba(0,0,0,0.95)',
          }}
        >
          {`${mm}:${ss}`}
        </div>

        {/* ─── Minecraft 18-Segment Progress Bar (Exact from Screenshot!) ──── */}
        <div className="w-full max-w-[340px] sm:max-w-[440px] flex items-center justify-between gap-1 p-1 rounded-sm bg-black/75 backdrop-blur-sm border-2 border-white/80 shadow-2xl">
          {Array.from({ length: totalSegments }).map((_, idx) => {
            const isFilled = idx < activeSegments
            return (
              <div
                key={idx}
                className={`flex-1 h-3 sm:h-3.5 border-r border-black/80 transition-all duration-300 ${
                  isFilled
                    ? 'bg-gradient-to-t from-emerald-500 to-green-400 shadow-[0_0_8px_#10b981]'
                    : 'bg-stone-900/60'
                }`}
              />
            )
          })}
        </div>

        {/* ─── Minecraft 9-Slot Hotbar HUD (Exact from Screenshot!) ─────────── */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-xl bg-stone-900/90 backdrop-blur-md border-2 border-stone-500 shadow-2xl">
          {/* Slot 1: Play / Pause */}
          <button
            onClick={onToggleRunning}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 flex items-center justify-center font-bold transition-all active:scale-90 ${
              running
                ? 'bg-amber-600/80 border-amber-300 text-white shadow-md'
                : 'bg-stone-800 border-stone-400 text-emerald-400 hover:bg-stone-700'
            }`}
            title={running ? 'إيقاف مؤقت' : 'بدء التركيز'}
          >
            {running ? <Pause size={17} /> : <Play size={17} className="translate-x-0.5" />}
          </button>

          {/* Slot 2: 25 Min Preset */}
          <button
            onClick={() => onSetPreset(25)}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 flex items-center justify-center font-bold text-xs transition-all active:scale-90 ${
              totalSeconds === 25 * 60
                ? 'bg-emerald-500 text-stone-950 border-white shadow-md font-black'
                : 'bg-stone-800 border-stone-600 text-white/90 hover:bg-stone-700'
            }`}
            title="25 دقيقة (بومودورو قياسي)"
          >
            25د
          </button>

          {/* Slot 3: 45 Min Preset */}
          <button
            onClick={() => onSetPreset(45)}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 flex items-center justify-center font-bold text-xs transition-all active:scale-90 ${
              totalSeconds === 45 * 60
                ? 'bg-emerald-500 text-stone-950 border-white shadow-md font-black'
                : 'bg-stone-800 border-stone-600 text-white/90 hover:bg-stone-700'
            }`}
            title="45 دقيقة (تركيز متقدم)"
          >
            45د
          </button>

          {/* Slot 4: 60 Min Preset */}
          <button
            onClick={() => onSetPreset(60)}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 flex items-center justify-center font-bold text-xs transition-all active:scale-90 ${
              totalSeconds === 60 * 60
                ? 'bg-emerald-500 text-stone-950 border-white shadow-md font-black'
                : 'bg-stone-800 border-stone-600 text-white/90 hover:bg-stone-700'
            }`}
            title="60 دقيقة (جلسة عميقة)"
          >
            60د
          </button>

          {/* Slot 5: +5 Min Add */}
          <button
            onClick={onAddFiveMinutes}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 flex items-center justify-center font-bold text-xs text-white/90 transition-all active:scale-90"
            title="إضافة 5 دقائق"
          >
            +5د
          </button>

          {/* Slot 6: Reset */}
          <button
            onClick={onReset}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 flex items-center justify-center text-white/90 transition-all active:scale-90"
            title="إعادة ضبط المؤقت"
          >
            <RotateCcw size={15} />
          </button>

          {/* Slot 7: Procedural Rain Toggle */}
          <button
            onClick={() => {
              const next = rainVolume > 0 ? 0 : 0.4
              setRainVolume(next)
              soundscapeEngine.setRain(next)
            }}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 flex items-center justify-center transition-all active:scale-90 ${
              rainVolume > 0
                ? 'bg-cyan-700/80 border-cyan-300 text-cyan-200 shadow-md'
                : 'bg-stone-800 border-stone-600 text-white/60 hover:text-white'
            }`}
            title="صوت المطر"
          >
            <CloudRain size={16} />
          </button>

          {/* Slot 8: Procedural Fireplace Toggle */}
          <button
            onClick={() => {
              const next = fireVolume > 0 ? 0 : 0.3
              setFireVolume(next)
              soundscapeEngine.setFire(next)
            }}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 flex items-center justify-center transition-all active:scale-90 ${
              fireVolume > 0
                ? 'bg-amber-700/80 border-amber-300 text-amber-200 shadow-md'
                : 'bg-stone-800 border-stone-600 text-white/60 hover:text-white'
            }`}
            title="حطب المدفأة"
          >
            <Flame size={16} />
          </button>

          {/* Slot 9: Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 flex items-center justify-center text-white/90 transition-all active:scale-90"
            title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* ─── 8. CRUCIAL: Database Session End & XP Claim Button ──────────── */}
        <button
          onClick={onCompleteSession}
          disabled={sessionLoading}
          className="flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-emerald-900/60 border-2 border-emerald-300 transition-all cursor-pointer"
          style={{
            textShadow: '1px 1px 0px #000',
          }}
        >
          <CheckCircle2 size={18} className="text-white" />
          <span>
            {sessionLoading
              ? 'جاري الحفظ في قاعدة البيانات...'
              : '⚔️ إنهاء الجلسة واحتساب XP في قاعدة البيانات'}
          </span>
        </button>
      </div>

      {/* ─── 9. Subject Picker Modal (Overlay) ────────────────────────────── */}
      <AnimatePresence>
        {showSubjectPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-stone-900/95 border-2 border-stone-600 p-5 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-700 mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-400" />
                  <span>اختر مادة الجلسة</span>
                </h3>
                <button
                  onClick={() => setShowSubjectPicker(false)}
                  className="text-stone-400 hover:text-white text-xs"
                >
                  ✕ إغلاق
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (onSelectSubject) onSelectSubject(s.id)
                      setShowSubjectPicker(false)
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      s.id === subject.id
                        ? 'bg-emerald-600/40 border-emerald-400 text-white shadow-md'
                        : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{s.icon}</span>
                      <span>{s.name}</span>
                    </div>
                    {s.id === subject.id && (
                      <span className="text-emerald-400 text-[10px]">المادة الحالية ✓</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 10. Database XP Victory & Achievement Modal ───────────────────── */}
      <AnimatePresence>
        {finished && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl bg-stone-900/95 border-2 border-emerald-400 p-6 shadow-2xl text-center text-white flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <Award size={36} />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-emerald-300 tracking-wider">
                  🏆 اكتملت الجلسة بنجاح!
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  تم تسجيل الجلسة بنجاح واحتساب نقاط الـ XP في قاعدة بيانات Supabase.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="p-3 rounded-xl bg-stone-800 border border-stone-700 flex flex-col items-center">
                  <span className="text-xs text-stone-400">الـ XP المكتسب</span>
                  <span className="text-base font-black text-emerald-400 mt-0.5">
                    +{earnedXp || Math.max(10, Math.round((totalSeconds / 60) * 1.5))} XP
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-800 border border-stone-700 flex flex-col items-center">
                  <span className="text-xs text-stone-400">مدة التركيز</span>
                  <span className="text-base font-black text-cyan-400 mt-0.5">
                    {Math.round(totalSeconds / 60)} دقيقة
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-800 border border-stone-700 flex flex-col items-center">
                  <span className="text-xs text-stone-400">التتابع</span>
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
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 border border-emerald-400"
                >
                  🔄 جلسة جديدة
                </button>

                <Link
                  href="/"
                  className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs transition-all border border-stone-600 text-center"
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
