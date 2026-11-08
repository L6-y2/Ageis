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
  Sliders,
  Volume2,
  VolumeX,
  Disc,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

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
  onToggleRunning: () => void
  onReset: () => void
  onSetPreset: (mins: number) => void
  onAddFiveMinutes: () => void
  onCompleteSession: () => void
  onToggleFullscreen: () => void
  onOpenMixer: () => void
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
  onToggleRunning,
  onReset,
  onSetPreset,
  onAddFiveMinutes,
  onCompleteSession,
  onToggleFullscreen,
  onOpenMixer,
}: Props) {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoMuted, setVideoMuted] = useState(true)
  const [iframeKey, setIframeKey] = useState(1)

  // Calculations
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - remaining) / totalSeconds) * 100))
  const currentPomodoroNum = (completedCycles % 4) + 1

  const toggleVideoSound = () => {
    setVideoMuted(!videoMuted)
    setIframeKey((prev) => prev + 1)
  }

  return (
    <div className="relative w-full h-full min-h-[580px] sm:min-h-screen flex flex-col justify-between select-none overflow-hidden bg-black text-white">
      {/* ─── 1. 4K High-Res Background (Fallback Image + Live 4K Looping Stream) ─── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
        {/* Crisp 2K / 4K Fallback Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/minecraft-cottage-2k.jpg"
          alt="Minecraft Rainy Cottage 4K"
          className="w-full h-full object-cover scale-105 pointer-events-none select-none"
        />

        {/* Live 4K YouTube Ambient Stream (Study with Me in Minecraft | Rainy Cottage) */}
        <iframe
          key={iframeKey}
          src={`https://www.youtube-nocookie.com/embed/S2dNJvtTo7Q?autoplay=1&mute=${
            videoMuted ? 1 : 0
          }&loop=1&playlist=S2dNJvtTo7Q&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1`}
          title="Minecraft Rainy Cottage Ambient 4K"
          className="absolute inset-0 w-full h-full object-cover scale-[1.12] pointer-events-none select-none"
          style={{ border: 'none', filter: 'brightness(0.92)' }}
          allow="autoplay; encrypted-media"
          onLoad={() => setVideoLoaded(true)}
        />

        {/* Ambient Darkening Vignette for HUD Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* ─── 2. Top HUD Bar (Exact Minecraft Study Room Styling) ─────────── */}
      <div className="relative z-20 flex items-center justify-between p-3 sm:p-6" dir="ltr">
        {/* Top-Left: Track / Jukebox Info & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white transition-all shadow-lg active:scale-95"
            title="العودة للصفحة الرئيسية"
          >
            <ArrowRight size={14} className="rotate-180" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Minecraft Jukebox Now Playing Disc */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 font-mono text-xs shadow-lg">
            <Disc size={15} className="text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="flex flex-col">
              <span className="font-bold text-white leading-tight">Beginning</span>
              <span className="text-[10px] text-white/70">C418 • Volume Alpha</span>
            </div>
          </div>

          {/* Active Subject Tag */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-300 shadow-lg">
            <span>{subject.icon}</span>
            <span>{subject.name}</span>
          </div>
        </div>

        {/* Top-Right: Pomodoro Cycle & Control Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pomodoro 1/4 Counter Badge */}
          <div className="px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 font-mono font-bold text-xs sm:text-sm text-emerald-400 tracking-wider shadow-lg">
            {`Pomodoro ${currentPomodoroNum}/4`}
          </div>

          {/* Toggle Video Ambient Audio */}
          <button
            onClick={toggleVideoSound}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all active:scale-95 shadow-lg ${
              videoMuted
                ? 'bg-black/60 border-white/20 text-white/70 hover:text-white'
                : 'bg-emerald-600/80 border-emerald-400 text-white'
            }`}
            title={videoMuted ? 'تشغيل صوت مطر وموسيقى الفيديو' : 'كتم صوت الفيديو'}
          >
            {videoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Sound Mixer Drawer Button */}
          <button
            onClick={onOpenMixer}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all active:scale-95 shadow-lg"
            title="مكسر الأصوات المحيطية"
          >
            <Sliders size={16} />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all active:scale-95 shadow-lg"
            title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* ─── 3. Center: Immersive 4K Rainy Atmosphere ─────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none">
        {/* Subtle Activity State Indicator */}
        <motion.div
          animate={{ opacity: running ? [0.7, 1, 0.7] : 0.6 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="text-center space-y-1"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 font-mono text-xs text-emerald-300">
            {mode === 'focus' ? '🌧️ Deep Focus Session' : '☕ Rest Break'}
          </span>
        </motion.div>
      </div>

      {/* ─── 4. Bottom HUD: Minecraft Timer & Inventory Hotbar ────────────── */}
      <div className="relative z-20 pb-5 sm:pb-8 flex flex-col items-center gap-3 px-2">
        {/* Giant Digital Minecraft Countdown Display */}
        <div className="flex flex-col items-center">
          <span
            dir="ltr"
            className="font-mono text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-widest drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
            style={{
              textShadow: '0 0 20px rgba(16, 185, 129, 0.4), 0 4px 8px #000',
            }}
          >
            {`${mm}:${ss}`}
          </span>
        </div>

        {/* ─── Minecraft Experience / Progress Bar ────────────────────────── */}
        <div className="w-full max-w-md sm:max-w-lg flex flex-col items-center gap-1 px-4">
          <div className="w-full h-2.5 sm:h-3 rounded-sm bg-black/80 border border-black p-0.5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300 rounded-sm shadow-[0_0_10px_#10b981]"
              style={{ width: `${progressPercent}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          {/* Level Number */}
          <span className="font-mono text-xs sm:text-sm font-black text-emerald-400 drop-shadow-[0_2px_4px_#000]">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* ─── Minecraft 9-Slot Hotbar Controls Frame ─────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-[#1c1d22]/90 backdrop-blur-xl border-2 border-[#3c3f4a] shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
          {/* Slot 1: Play/Pause */}
          <button
            onClick={onToggleRunning}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all border active:scale-95 ${
              running
                ? 'bg-amber-600/80 border-amber-400 text-white shadow-md shadow-amber-600/30'
                : 'bg-emerald-600/80 border-emerald-400 text-white shadow-md shadow-emerald-600/30'
            }`}
            title={running ? 'إيقاف مؤقت' : 'بدء التركيز'}
          >
            {running ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
          </button>

          {/* Slot 2: 25 Min Preset */}
          <button
            onClick={() => onSetPreset(25)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-all border active:scale-95 ${
              totalSeconds === 25 * 60
                ? 'bg-emerald-500 text-slate-950 border-white shadow-md'
                : 'bg-black/50 border-white/10 text-white/80 hover:text-white hover:bg-black/70'
            }`}
            title="جلسة 25 دقيقة قياسية"
          >
            25د
          </button>

          {/* Slot 3: 45 Min Preset */}
          <button
            onClick={() => onSetPreset(45)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-all border active:scale-95 ${
              totalSeconds === 45 * 60
                ? 'bg-emerald-500 text-slate-950 border-white shadow-md'
                : 'bg-black/50 border-white/10 text-white/80 hover:text-white hover:bg-black/70'
            }`}
            title="جلسة 45 دقيقة متقدمة"
          >
            45د
          </button>

          {/* Slot 4: 60 Min Preset */}
          <button
            onClick={() => onSetPreset(60)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-all border active:scale-95 ${
              totalSeconds === 60 * 60
                ? 'bg-emerald-500 text-slate-950 border-white shadow-md'
                : 'bg-black/50 border-white/10 text-white/80 hover:text-white hover:bg-black/70'
            }`}
            title="جلسة 60 دقيقة عميقة"
          >
            60د
          </button>

          {/* Slot 5: +5 Min Add */}
          <button
            onClick={onAddFiveMinutes}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/50 hover:bg-black/70 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white/80 hover:text-white transition-all active:scale-95"
            title="إضافة 5 دقائق إضافية"
          >
            +5د
          </button>

          {/* Slot 6: Reset */}
          <button
            onClick={onReset}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/50 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
            title="إعادة ضبط المؤقت"
          >
            <RotateCcw size={16} />
          </button>

          {/* Slot 7: Complete Session & Claim XP */}
          {activeSessionId && (
            <button
              onClick={onCompleteSession}
              disabled={sessionLoading}
              className="px-3 h-10 sm:h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400 flex items-center gap-1.5 font-bold text-xs text-white transition-all active:scale-95 shadow-md shadow-emerald-600/30"
              title="إنهاء الجلسة واحتساب نقاط الـ XP"
            >
              <CheckCircle2 size={16} />
              <span className="hidden sm:inline">إنهاء وXP</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
