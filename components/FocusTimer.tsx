'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Award,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Plus,
  Target,
  Sparkles,
  Flame,
  Coffee,
  Brain,
  Compass,
} from 'lucide-react'
import { SUBJECTS } from '@/lib/types'
import { useSearchParams } from 'next/navigation'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

const FOCUS_PRESETS = [
  { label: '25 دقيقة', minutes: 25, title: 'بومودورو قياسي' },
  { label: '45 دقيقة', minutes: 45, title: 'تركيز متقدم' },
  { label: '60 دقيقة', minutes: 60, title: 'جلسة عميقة' },
  { label: '90 دقيقة', minutes: 90, title: 'ماراثون دراسي' },
]

// Web Audio API pure synthesized chimes (zero network latency / 100% reliable)
function playSound(type: 'complete' | 'break' | 'tick') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    if (type === 'complete') {
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12)
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.12 + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 1.2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 1.3)
      })
    } else if (type === 'break') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 1.5)
    }
  } catch (err) {
    console.warn('AudioContext prevented by browser policy until interaction', err)
  }
}

function TimerContent() {
  const searchParams = useSearchParams()
  const subjectParam = searchParams.get('subject')
  const initialSubject = subjectParam ? parseInt(subjectParam) : SUBJECTS[0].id

  const [mode, setMode] = useState<TimerMode>('focus')
  const [selectedSubject, setSelectedSubject] = useState(
    SUBJECTS.some((s) => s.id === initialSubject) ? initialSubject : SUBJECTS[0].id
  )
  const [totalSeconds, setTotalSeconds] = useState(25 * 60)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [earnedXp, setEarnedXp] = useState<number | null>(null)
  const [sessionGoal, setSessionGoal] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isZenMode, setIsZenMode] = useState(false)
  const [completedCycles, setCompletedCycles] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const subject = SUBJECTS.find((s) => s.id === selectedSubject) || SUBJECTS[0]

  // Dial Geometry
  const radius = 115
  const circumference = 2 * Math.PI * radius
  const progressFraction = (totalSeconds - remaining) / totalSeconds
  const dashOffset = circumference * (1 - progressFraction)

  // Tip indicator position
  const angle = progressFraction * 360 - 90
  const tipX = 140 + radius * Math.cos((angle * Math.PI) / 180)
  const tipY = 140 + radius * Math.sin((angle * Math.PI) / 180)

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  const estXpReward = Math.max(10, Math.round((totalSeconds / 60) * 1.5))

  const triggerConfetti = async () => {
    try {
      const confetti = (await import('canvas-confetti')).default
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#06b6d4', '#f59e0b'],
      })
    } catch (e) {
      console.error(e)
    }
  }

  const saveSession = async (mins: number) => {
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          durationMinutes: mins,
        }),
      })
      if (res.ok) {
        setEarnedXp(estXpReward)
        setCompletedCycles((prev) => prev + 1)
      }
    } catch (err) {
      console.error('Save session error:', err)
    }
  }

  // Ticking logic
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false)
            setFinished(true)
            if (soundEnabled) {
              playSound(mode === 'focus' ? 'complete' : 'break')
            }
            if (mode === 'focus') {
              const mins = Math.round(totalSeconds / 60)
              triggerConfetti()
              saveSession(mins)
            }
            return 0
          }
          return r - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, totalSeconds, selectedSubject, mode, soundEnabled])

  const reset = useCallback(() => {
    setRunning(false)
    setFinished(false)
    setEarnedXp(null)
    setRemaining(totalSeconds)
  }, [totalSeconds])

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setRunning(false)
    setFinished(false)
    setEarnedXp(null)
    if (newMode === 'focus') {
      setTotalSeconds(25 * 60)
      setRemaining(25 * 60)
    } else if (newMode === 'shortBreak') {
      setTotalSeconds(5 * 60)
      setRemaining(5 * 60)
    } else if (newMode === 'longBreak') {
      setTotalSeconds(15 * 60)
      setRemaining(15 * 60)
    }
  }

  const setPresetMinutes = (minutes: number) => {
    const secs = minutes * 60
    setTotalSeconds(secs)
    setRemaining(secs)
    setRunning(false)
    setFinished(false)
    setEarnedXp(null)
  }

  const addFiveMinutes = () => {
    setTotalSeconds((prev) => prev + 300)
    setRemaining((prev) => prev + 300)
  }

  // Generate 60 dial tick marks
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const tickAngle = (i / 60) * 360 - 90
    const rad = (tickAngle * Math.PI) / 180
    const isMajor = i % 5 === 0
    const outerR = 138
    const innerR = isMajor ? 128 : 133
    const x1 = 140 + outerR * Math.cos(rad)
    const y1 = 140 + outerR * Math.sin(rad)
    const x2 = 140 + innerR * Math.cos(rad)
    const y2 = 140 + innerR * Math.sin(rad)
    const isElapsed = (i / 60) <= progressFraction
    return { x1, y1, x2, y2, isMajor, isElapsed }
  })

  return (
    <div
      className={`transition-all duration-300 ${
        isZenMode
          ? 'fixed inset-0 z-50 bg-[#0e1217] flex flex-col items-center justify-center p-6 overflow-y-auto'
          : 'flex flex-col items-center gap-6'
      }`}
    >
      {/* ─── Zen Mode Header ───────────────────────────────────────────────── */}
      {isZenMode && (
        <div className="w-full max-w-md flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-300">وضع التركيز الهادئ (Zen)</span>
          </div>
          <button
            onClick={() => setIsZenMode(false)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="الخروج من وضع الهدوء"
          >
            <Minimize2 size={18} />
          </button>
        </div>
      )}

      {/* ─── Mode Switcher (Pill Segmented Selector) ────────────────────────── */}
      <div className="flex items-center p-1.5 rounded-2xl bg-[#141922] border border-slate-800 shadow-inner max-w-sm w-full">
        <button
          onClick={() => switchMode('focus')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'focus'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain size={14} />
          <span>تركيز عميق</span>
        </button>

        <button
          onClick={() => switchMode('shortBreak')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'shortBreak'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coffee size={14} />
          <span>راحة قصيرة</span>
        </button>

        <button
          onClick={() => switchMode('longBreak')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'longBreak'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass size={14} />
          <span>راحة طويلة</span>
        </button>
      </div>

      {/* ─── Subject Selection (Only in Focus mode) ─────────────────────────── */}
      {mode === 'focus' && !isZenMode && (
        <div className="flex gap-2 flex-wrap justify-center max-w-md">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSubject(s.id)
                reset()
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${
                selectedSubject === s.id
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-sm">{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* ─── Duration Presets (Focus Mode) ─────────────────────────────────── */}
      {mode === 'focus' && !isZenMode && (
        <div className="flex gap-2">
          {FOCUS_PRESETS.map((p) => (
            <button
              key={p.minutes}
              onClick={() => setPresetMinutes(p.minutes)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                totalSeconds === p.minutes * 60
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* ─── High-End Precision Chronometer Dial ────────────────────────────── */}
      <div className="relative flex items-center justify-center my-2">
        {/* Ambient Breathing Focus Halo */}
        <div
          className={`absolute w-72 h-72 rounded-full pointer-events-none transition-all duration-1000 ${
            running
              ? 'bg-emerald-500/15 blur-3xl animate-pulse'
              : 'bg-slate-800/20 blur-2xl'
          }`}
        />

        <svg width="280" height="280" viewBox="0 0 280 280" className="relative z-10 select-none">
          <defs>
            <linearGradient id="focusProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <linearGradient id="breakProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>

            <filter id="dialGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Tick Marks */}
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={
                t.isElapsed
                  ? mode === 'focus'
                    ? '#10b981'
                    : '#f59e0b'
                  : t.isMajor
                  ? 'rgba(255, 255, 255, 0.22)'
                  : 'rgba(255, 255, 255, 0.08)'
              }
              strokeWidth={t.isMajor ? 2.2 : 1.2}
              strokeLinecap="round"
              className="transition-colors duration-300"
            />
          ))}

          {/* Background Track Circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="#161b24"
            strokeWidth="9"
          />

          {/* Inner Accent Ring */}
          <circle
            cx="140"
            cy="140"
            r={radius - 12}
            fill="none"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="1"
          />

          {/* Active Animated Progress Arc */}
          <motion.circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={mode === 'focus' ? 'url(#focusProgressGrad)' : 'url(#breakProgressGrad)'}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 140 140)"
            filter="url(#dialGlow)"
            transition={{ duration: 0.6, ease: 'linear' }}
          />

          {/* Glowing Lead Indicator Dot */}
          {running && progressFraction > 0 && progressFraction < 1 && (
            <circle
              cx={tipX}
              cy={tipY}
              r="6"
              fill="#ffffff"
              filter="drop-shadow(0 0 6px #10b981)"
            />
          )}
        </svg>

        {/* Center Digital Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div
                key="done"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center px-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                  <CheckCircle2 size={26} />
                </div>
                <h3 className="text-emerald-400 font-black text-sm">
                  {mode === 'focus' ? 'اكتملت الجلسة بنجاح!' : 'انتهت الاستراحة! جاهز؟'}
                </h3>
                {earnedXp && (
                  <span className="mt-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1 shadow-sm">
                    <Award size={14} />
                    <span>+{earnedXp} XP تم إضافتها لحسابك</span>
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div key="timer" className="flex flex-col items-center">
                {/* Mode & Subject Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-bold text-slate-300 mb-1">
                  <span>{mode === 'focus' ? subject.icon : '☕'}</span>
                  <span>{mode === 'focus' ? subject.name : 'وقت الاستراحة'}</span>
                </div>

                {/* Massive Tabular Digits */}
                <div className="flex items-baseline font-mono text-5xl sm:text-6xl font-black text-white tracking-tight drop-shadow-md">
                  <span>{mm}</span>
                  <span className="animate-pulse text-emerald-400/80 mx-0.5">:</span>
                  <span>{ss}</span>
                </div>

                {/* Subtext info */}
                <p className="text-[11px] font-semibold text-slate-400 mt-1 font-mono">
                  {Math.round(progressFraction * 100)}% مكتمل
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Goal / Intention Input (Focus Mode) ────────────────────────────── */}
      {mode === 'focus' && !finished && (
        <div className="w-full max-w-sm px-2">
          <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-[#141922] border border-slate-800 focus-within:border-emerald-500/60 transition-colors">
            <Target size={15} className="text-emerald-400 flex-shrink-0" />
            <input
              type="text"
              value={sessionGoal}
              onChange={(e) => setSessionGoal(e.target.value)}
              placeholder="هدف الجلسة: مثلاً حل 10 تمارين نحو..."
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
              dir="auto"
            />
          </div>
        </div>
      )}

      {/* ─── Tactile Instrument Controls ───────────────────────────────────── */}
      <div className="flex items-center gap-4 mt-2">
        {/* Reset Button */}
        <button
          onClick={reset}
          className="w-12 h-12 rounded-2xl bg-[#141922] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95 shadow-sm"
          title="إعادة ضبط المؤقت"
        >
          <RotateCcw size={18} />
        </button>

        {/* Master Play / Pause Trigger */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            if (!finished) {
              setRunning(!running)
            } else {
              reset()
            }
          }}
          className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl transition-all ${
            running
              ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/30 hover:brightness-110'
          }`}
          title={running ? 'إيقاف مؤقت' : 'بدء التركيز'}
        >
          {running ? (
            <Pause size={30} />
          ) : (
            <Play size={30} className="translate-x-0.5" />
          )}
        </motion.button>

        {/* +5 Minutes Extension Button */}
        <button
          onClick={addFiveMinutes}
          className="w-12 h-12 rounded-2xl bg-[#141922] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all active:scale-95 shadow-sm"
          title="إضافة 5 دقائق"
        >
          <div className="flex items-center text-xs font-bold font-mono">
            <span>+5</span>
          </div>
        </button>
      </div>

      {/* ─── Bottom Utilities Bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-6 text-xs text-slate-400 pt-2">
        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
          title={soundEnabled ? 'كتم التنبيه' : 'تشغيل التنبيه'}
        >
          {soundEnabled ? (
            <Volume2 size={16} className="text-emerald-400" />
          ) : (
            <VolumeX size={16} className="text-slate-500" />
          )}
          <span>{soundEnabled ? 'التنبيه مُفعل' : 'التنبيه مكتوم'}</span>
        </button>

        {/* Zen Mode Toggle */}
        <button
          onClick={() => setIsZenMode(!isZenMode)}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
          title="وضع الهدوء الكامل"
        >
          <Maximize2 size={15} className="text-teal-400" />
          <span>وضع الهدوء</span>
        </button>

        {/* Live Reward Pill */}
        {mode === 'focus' && (
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Sparkles size={13} />
            <span>+{estXpReward} XP</span>
          </div>
        )}
      </div>

      {/* ─── Pomodoro Cycles Dots ─────────────────────────────────────────── */}
      {mode === 'focus' && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500">جلسات اليوم:</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((cycleIdx) => (
              <span
                key={cycleIdx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  cycleIdx < (completedCycles % 4)
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FocusTimer() {
  return (
    <Suspense
      fallback={
        <div className="text-slate-500 text-center py-16 text-sm">
          جاري تحميل غرفة التركيز...
        </div>
      }
    >
      <TimerContent />
    </Suspense>
  )
}
