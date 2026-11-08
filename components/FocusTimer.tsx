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
  Radio,
  Sliders,
  CloudRain,
  Wind,
  Layers,
  ListTodo,
  Check,
  ChevronRight,
  Music,
  SkipForward,
  SkipBack,
  Volume1,
} from 'lucide-react'
import { SUBJECTS } from '@/lib/types'
import { useSearchParams } from 'next/navigation'
import CozyStudyRoom from '@/components/CozyStudyRoom'
import { soundscapeEngine } from '@/lib/soundscapes'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

const FOCUS_PRESETS = [
  { label: '25 دقيقة', minutes: 25, title: 'بومودورو قياسي' },
  { label: '45 دقيقة', minutes: 45, title: 'تركيز متقدم' },
  { label: '60 دقيقة', minutes: 60, title: 'جلسة عميقة' },
  { label: '90 دقيقة', minutes: 90, title: 'ماراثون دراسي' },
]

const LOFI_STATIONS = [
  { name: 'Tesk - driftaway ☕', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  { name: 'Chillhop Study Lounge 🌙', url: 'https://play.streamafrica.net/lofiradio' },
  { name: 'Rainy Loft Beats 🌧️', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
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

// ─── Persistent Storage Helpers for Uninterrupted Timer ──────────────────────────
export const POMODORO_STORAGE_KEY = 'aegis_pomodoro_state'

interface StoredPomodoroState {
  running: boolean
  mode: TimerMode
  selectedSubject: number
  totalSeconds: number
  remaining: number
  targetEndTime: number | null
  activeSessionId: number | null
  sessionGoal: string
  completedCycles: number
}

function getStoredPomodoro(): StoredPomodoroState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(POMODORO_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveStoredPomodoro(patch: Partial<StoredPomodoroState>) {
  if (typeof window === 'undefined') return
  try {
    const existing = getStoredPomodoro() || {
      running: false,
      mode: 'focus' as TimerMode,
      selectedSubject: SUBJECTS[0].id,
      totalSeconds: 25 * 60,
      remaining: 25 * 60,
      targetEndTime: null,
      activeSessionId: null,
      sessionGoal: '',
      completedCycles: 0,
    }
    const updated = { ...existing, ...patch }
    localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}

function clearStoredPomodoro() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(POMODORO_STORAGE_KEY)
  } catch {}
}

function TimerContent() {
  const searchParams = useSearchParams()
  const subjectParam = searchParams.get('subject')
  const initialSubject = subjectParam ? parseInt(subjectParam) : SUBJECTS[0].id

  // ── View Mode: 'cozy' (Isometric Study Room) or 'dial' (Standard Precision Chronometer) ──
  const [studioMode, setStudioMode] = useState<'cozy' | 'dial'>('cozy')
  const [showMixer, setShowMixer] = useState(true)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [clockTime, setClockTime] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [catPurring, setCatPurring] = useState(false)

  // ── Ambient Sound Mixer State (0 to 1) ──
  const [ambient, setAmbient] = useState({
    rain: 0,
    fire: 0.25,
    wind: 0,
    brown: 0,
  })

  // ── Lo-Fi Chill Music Player State ──
  const [lofiStationIndex, setLofiStationIndex] = useState(0)
  const [lofiPlaying, setLofiPlaying] = useState(false)
  const [lofiVolume, setLofiVolume] = useState(0.45)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ── Core Timer States ──
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

  // Database Connection States
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const activeSessionIdRef = useRef<number | null>(null)
  const targetEndTimeRef = useRef<number | null>(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionStats, setSessionStats] = useState<{
    streak?: number
    hours?: number
    message?: string
    rewards?: string[]
  } | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const subject = SUBJECTS.find((s) => s.id === selectedSubject) || SUBJECTS[0]

  // Synchronize ref whenever activeSessionId changes
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  // Digital clock (15:11 AM/PM format matching reference)
  useEffect(() => {
    const update = () => {
      const d = new Date()
      const hours = d.getHours()
      const mins = String(d.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const formattedHour = String(hours % 12 || 12).padStart(2, '0')
      setClockTime(`${formattedHour}:${mins} ${ampm}`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  // Sync Lo-Fi audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = lofiVolume
    }
  }, [lofiVolume])

  // Restore preferred studio mode & timer state on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('aegis_focus_studio_mode')
      if (savedMode === 'cozy' || savedMode === 'dial') {
        setStudioMode(savedMode)
      }
    } catch {}

    const saved = getStoredPomodoro()
    if (saved) {
      if (saved.mode) setMode(saved.mode)
      if (saved.selectedSubject && SUBJECTS.some((s) => s.id === saved.selectedSubject)) {
        setSelectedSubject(saved.selectedSubject)
      }
      if (saved.totalSeconds) setTotalSeconds(saved.totalSeconds)
      if (saved.sessionGoal) setSessionGoal(saved.sessionGoal)
      if (saved.completedCycles) setCompletedCycles(saved.completedCycles)
      if (saved.activeSessionId) {
        setActiveSessionId(saved.activeSessionId)
        activeSessionIdRef.current = saved.activeSessionId
      }

      if (saved.running && saved.targetEndTime) {
        const now = Date.now()
        const diffSeconds = Math.max(0, Math.round((saved.targetEndTime - now) / 1000))
        targetEndTimeRef.current = saved.targetEndTime

        if (diffSeconds > 0) {
          // Timer was and is still running! Continue counting down seamlessly
          setRemaining(diffSeconds)
          setRunning(true)
        } else {
          // Finished while the user was away
          setRemaining(0)
          setRunning(false)
          targetEndTimeRef.current = null
          setTimeout(() => {
            completeSessionRef.current(saved.activeSessionId)
          }, 300)
        }
      } else if (typeof saved.remaining === 'number' && saved.remaining > 0) {
        setRemaining(saved.remaining)
        setRunning(false)
      }
    }

    // Check database for active session
    fetch('/api/session')
      .then((r) => r.json())
      .then((res) => {
        if (res?.activeSession?.id) {
          const startTime = res.activeSession.start_time ? new Date(res.activeSession.start_time).getTime() : 0
          const ageHours = (Date.now() - startTime) / (1000 * 60 * 60)
          if (ageHours > 3) {
            fetch('/api/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'cancel', sessionId: res.activeSession.id }),
            }).catch(() => {})
            clearStoredPomodoro()
          } else {
            setActiveSessionId(res.activeSession.id)
            activeSessionIdRef.current = res.activeSession.id
            if (res.activeSession.subject_id) {
              setSelectedSubject(res.activeSession.subject_id)
            }

            if (!targetEndTimeRef.current) {
              const elapsedSec = Math.floor((Date.now() - startTime) / 1000)
              const defaultTotal = 25 * 60
              if (elapsedSec < defaultTotal) {
                const rem = defaultTotal - elapsedSec
                const target = Date.now() + rem * 1000
                targetEndTimeRef.current = target
                setTotalSeconds(defaultTotal)
                setRemaining(rem)
                setRunning(true)
                saveStoredPomodoro({
                  running: true,
                  mode: 'focus',
                  selectedSubject: res.activeSession.subject_id || SUBJECTS[0].id,
                  totalSeconds: defaultTotal,
                  remaining: rem,
                  targetEndTime: target,
                  activeSessionId: res.activeSession.id,
                  sessionGoal: res.activeSession.notes || '',
                  completedCycles: 0,
                })
              }
            }
          }
        }
      })
      .catch(() => {})
  }, [])

  // Ambient sound handlers
  const handleAmbientChange = (type: 'rain' | 'fire' | 'wind' | 'brown', val: number) => {
    setAmbient((prev) => ({ ...prev, [type]: val }))
    if (type === 'rain') soundscapeEngine.setRain(val)
    if (type === 'fire') soundscapeEngine.setFire(val)
    if (type === 'wind') soundscapeEngine.setWind(val)
    if (type === 'brown') soundscapeEngine.setBrownNoise(val)
  }

  // Toggle Lo-Fi music
  const toggleLofi = () => {
    if (!audioRef.current) return
    if (lofiPlaying) {
      audioRef.current.pause()
      setLofiPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setLofiPlaying(true))
        .catch((e) => console.warn('Lofi stream autoplay policy', e))
    }
  }

  const changeLofiStation = (dir: 1 | -1) => {
    const nextIdx = (lofiStationIndex + dir + LOFI_STATIONS.length) % LOFI_STATIONS.length
    setLofiStationIndex(nextIdx)
    if (audioRef.current) {
      audioRef.current.src = LOFI_STATIONS[nextIdx].url
      if (lofiPlaying) {
        audioRef.current.play().catch(() => {})
      }
    }
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Pet the cat interaction
  const handlePetCat = () => {
    setCatPurring(true)
    setTimeout(() => setCatPurring(false), 2500)
  }

  // Dial Geometry & Timing Formats
  const radius = 115
  const circumference = 2 * Math.PI * radius
  const progressFraction = (totalSeconds - remaining) / totalSeconds
  const dashOffset = circumference * (1 - progressFraction)

  // STRICT MINUTE ON LEFT, SECOND ON RIGHT IN RTL (<span dir="ltr">mm:ss</span>)
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
        colors: ['#10b981', '#34d399', '#06b6d4', '#f59e0b', '#f43f5e'],
      })
    } catch (e) {
      console.error(e)
    }
  }

  // ─── Complete and Log Session to Database ────────────────────────────────
  const completeSession = useCallback(
    async (forcedSessionId?: any) => {
      setRunning(false)
      targetEndTimeRef.current = null
      setFinished(true)
      clearStoredPomodoro()

      if (soundEnabled) {
        playSound(mode === 'focus' ? 'complete' : 'break')
      }

      const sessId =
        typeof forcedSessionId === 'number'
          ? forcedSessionId
          : activeSessionIdRef.current || activeSessionId

      if (mode === 'focus') {
        setCompletedCycles((c) => {
          const next = c + 1
          saveStoredPomodoro({ completedCycles: next })
          return next
        })
        triggerConfetti()

        setSessionLoading(true)
        try {
          const actualMins = Math.round(totalSeconds / 60)
          const res = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'complete',
              sessionId: sessId,
              durationMinutes: actualMins,
              subjectId: selectedSubject,
              notes: sessionGoal,
            }),
          })
          const data = await res.json()
          if (data.success) {
            setEarnedXp(data.xpEarned || estXpReward)
            setSessionStats({
              streak: data.streak,
              hours: data.totalHours,
              message: data.message,
              rewards: data.rewards,
            })
            setActiveSessionId(null)
            activeSessionIdRef.current = null
          }
        } catch (e) {
          console.error('Session complete error:', e)
        } finally {
          setSessionLoading(false)
        }
      } else {
        setActiveSessionId(null)
        activeSessionIdRef.current = null
      }
    },
    [mode, totalSeconds, selectedSubject, sessionGoal, soundEnabled, estXpReward, activeSessionId]
  )

  const completeSessionRef = useRef(completeSession)
  useEffect(() => {
    completeSessionRef.current = completeSession
  }, [completeSession])

  // Wall-Clock Accurate Countdown Loop
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (targetEndTimeRef.current) {
          const now = Date.now()
          const diff = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000))

          setRemaining(diff)
          saveStoredPomodoro({
            running: true,
            remaining: diff,
            targetEndTime: targetEndTimeRef.current,
            activeSessionId: activeSessionIdRef.current || activeSessionId,
            selectedSubject,
            mode,
            totalSeconds,
            sessionGoal,
            completedCycles,
          })

          if (diff <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            completeSessionRef.current()
          }
        } else {
          setRemaining((prev) => {
            if (prev <= 1) {
              if (intervalRef.current) clearInterval(intervalRef.current)
              completeSessionRef.current()
              return 0
            }
            return prev - 1
          })
        }
      }, 500)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, selectedSubject, mode, totalSeconds, sessionGoal, completedCycles, activeSessionId])

  // Start Timer
  const startTimer = async () => {
    if (remaining <= 0) return

    const target = Date.now() + remaining * 1000
    targetEndTimeRef.current = target
    setRunning(true)
    setFinished(false)

    saveStoredPomodoro({
      running: true,
      mode,
      selectedSubject,
      totalSeconds,
      remaining,
      targetEndTime: target,
      activeSessionId: activeSessionIdRef.current || activeSessionId,
      sessionGoal,
      completedCycles,
    })

    if (mode === 'focus' && !activeSessionIdRef.current) {
      setSessionLoading(true)
      try {
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            subjectId: selectedSubject,
            durationMinutes: Math.round(totalSeconds / 60),
            notes: sessionGoal,
          }),
        })
        const data = await res.json()
        if (data.success && data.sessionId) {
          setActiveSessionId(data.sessionId)
          activeSessionIdRef.current = data.sessionId
          saveStoredPomodoro({ activeSessionId: data.sessionId })
        }
      } catch (e) {
        console.error('Session start error:', e)
      } finally {
        setSessionLoading(false)
      }
    }
  }

  // Pause Timer
  const pauseTimer = () => {
    setRunning(false)
    targetEndTimeRef.current = null
    saveStoredPomodoro({
      running: false,
      remaining,
      targetEndTime: null,
      activeSessionId: activeSessionIdRef.current || activeSessionId,
    })
  }

  // Toggle Running
  const toggleRunning = () => {
    if (running) {
      pauseTimer()
    } else {
      startTimer()
    }
  }

  // Reset Timer
  const handleReset = () => {
    setRunning(false)
    targetEndTimeRef.current = null
    setRemaining(totalSeconds)
    setFinished(false)
    setEarnedXp(null)
    setSessionStats(null)

    if (activeSessionIdRef.current && mode === 'focus') {
      fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', sessionId: activeSessionIdRef.current }),
      }).catch(() => {})
      setActiveSessionId(null)
      activeSessionIdRef.current = null
    }

    clearStoredPomodoro()
  }

  // Switch Mode
  const switchMode = (newMode: TimerMode) => {
    setRunning(false)
    targetEndTimeRef.current = null
    setFinished(false)
    setEarnedXp(null)
    setSessionStats(null)
    setMode(newMode)

    let secs = 25 * 60
    if (newMode === 'shortBreak') secs = 5 * 60
    if (newMode === 'longBreak') secs = 15 * 60

    setTotalSeconds(secs)
    setRemaining(secs)

    saveStoredPomodoro({
      running: false,
      mode: newMode,
      totalSeconds: secs,
      remaining: secs,
      targetEndTime: null,
    })
  }

  // Preset Minutes
  const setPresetMinutes = (mins: number) => {
    if (running) return
    const secs = mins * 60
    setTotalSeconds(secs)
    setRemaining(secs)
    saveStoredPomodoro({ totalSeconds: secs, remaining: secs })
  }

  // Add 5 minutes
  const addFiveMinutes = () => {
    setTotalSeconds((prevTotal) => {
      const nextTotal = prevTotal + 300
      setRemaining((prevRem) => {
        const nextRem = prevRem + 300
        if (running && targetEndTimeRef.current) {
          targetEndTimeRef.current += 300 * 1000
        }
        saveStoredPomodoro({
          totalSeconds: nextTotal,
          remaining: nextRem,
          targetEndTime: targetEndTimeRef.current,
        })
        return nextRem
      })
      return nextTotal
    })
  }

  const currentStation = LOFI_STATIONS[lofiStationIndex]

  return (
    <div
      className={`relative w-full transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#1b1022] p-4 sm:p-8 flex flex-col justify-between overflow-y-auto'
          : 'space-y-4'
      }`}
    >
      {/* Hidden Lo-Fi Stream Audio Element */}
      <audio ref={audioRef} src={currentStation.url} preload="none" />

      {/* ─── Mode Switcher Bar (Cozy Room vs Precision Dial) ──────────────── */}
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-[#23122b] border border-white/10 shadow-lg">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setStudioMode('cozy')
              try {
                localStorage.setItem('aegis_focus_studio_mode', 'cozy')
              } catch {}
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              studioMode === 'cozy'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏡 استوديو اللوفاي والكوزي</span>
          </button>

          <button
            onClick={() => {
              setStudioMode('dial')
              try {
                localStorage.setItem('aegis_focus_studio_mode', 'dial')
              } catch {}
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              studioMode === 'dial'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⏱️ قرص التوقيت</span>
          </button>
        </div>

        {/* Fullscreen & Timer Mode Indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-white/10"
            title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. COZY LOFI STUDY ROOM (MATCHING USER REFERENCE SCREENSHOT)       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {studioMode === 'cozy' ? (
        <div className="relative w-full rounded-3xl bg-[#281530] border border-purple-900/40 shadow-2xl overflow-hidden p-4 sm:p-7 text-white">
          {/* ─── Top Left: Activity & Timer Status ────────────────────────── */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 flex flex-col gap-1.5 text-left" dir="ltr">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleRunning}
                className="w-7 h-7 rounded-lg bg-black/40 hover:bg-black/60 border border-white/15 flex items-center justify-center text-white transition-all active:scale-95 shadow-sm"
              >
                {running ? <Pause size={13} /> : <Play size={13} className="translate-x-0.5" />}
              </button>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                <span>{mode === 'focus' ? 'Activity: Deep Focus' : 'Break: Rest Time'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 pl-1">
              <span className="text-pink-400">🔁</span>
              <span className="text-sm font-black text-white">{`${mm}:${ss}`}</span>
              <span className="text-[11px] text-slate-400">{running ? 'running' : 'paused'}</span>
            </div>

            {/* Current Active Subject Tag */}
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-bold text-slate-300">
                <span>{subject.icon}</span>
                <span>{subject.name}</span>
              </span>
            </div>
          </div>

          {/* ─── Top Right: Clock & Side Mixer Toggle ─────────────────────── */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex flex-col items-end gap-2.5">
            {/* Digital Clock (HH:MM AM/PM) */}
            <div className="px-3.5 py-1.5 rounded-xl bg-black/50 border border-white/15 font-mono text-xs sm:text-sm font-black text-white tracking-wider shadow-lg">
              {clockTime || '15:11 PM'}
            </div>

            {/* Quick Actions (Goal, Fullscreen, Mixer Toggle) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
              <button
                onClick={() => setShowGoalModal(true)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="تحديد هدف الجلسة"
              >
                <ListTodo size={15} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="ملء الشاشة"
              >
                <Maximize2 size={15} />
              </button>
              <button
                onClick={() => setShowMixer(!showMixer)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showMixer ? 'bg-pink-600 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="مكسر الأصوات المحيطية"
              >
                <Sliders size={15} />
              </button>
            </div>

            {/* ─── Ambient Sound Mixer Vertical Panel (From Screenshot!) ──── */}
            <AnimatePresence>
              {showMixer && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col gap-3.5 w-24 sm:w-28 text-center"
                >
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    Sound Mixer
                  </span>

                  {/* 🌧️ Rain Slider */}
                  <div className="flex flex-col items-center gap-1">
                    <CloudRain
                      size={18}
                      className={ambient.rain > 0 ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={ambient.rain}
                      onChange={(e) => handleAmbientChange('rain', parseFloat(e.target.value))}
                      className="w-16 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      title="صوت المطر"
                    />
                    <span className="text-[9px] font-mono text-slate-400">{Math.round(ambient.rain * 100)}%</span>
                  </div>

                  {/* 🔥 Fireplace Slider */}
                  <div className="flex flex-col items-center gap-1">
                    <Flame
                      size={18}
                      className={ambient.fire > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={ambient.fire}
                      onChange={(e) => handleAmbientChange('fire', parseFloat(e.target.value))}
                      className="w-16 accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      title="حطب المدفأة"
                    />
                    <span className="text-[9px] font-mono text-slate-400">{Math.round(ambient.fire * 100)}%</span>
                  </div>

                  {/* 💨 Wind Slider */}
                  <div className="flex flex-col items-center gap-1">
                    <Wind
                      size={18}
                      className={ambient.wind > 0 ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={ambient.wind}
                      onChange={(e) => handleAmbientChange('wind', parseFloat(e.target.value))}
                      className="w-16 accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      title="نسيم الرياح"
                    />
                    <span className="text-[9px] font-mono text-slate-400">{Math.round(ambient.wind * 100)}%</span>
                  </div>

                  {/* 🧠 Deep Focus Brown Noise */}
                  <div className="flex flex-col items-center gap-1">
                    <Brain
                      size={18}
                      className={ambient.brown > 0 ? 'text-pink-400 animate-pulse' : 'text-slate-400'}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={ambient.brown}
                      onChange={(e) => handleAmbientChange('brown', parseFloat(e.target.value))}
                      className="w-16 accent-pink-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      title="ضوضاء بنية للتركيز"
                    />
                    <span className="text-[9px] font-mono text-slate-400">{Math.round(ambient.brown * 100)}%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Centerpiece: Isometric Cozy Study Cabin ─────────────────── */}
          <div className="py-6 sm:py-8 my-auto relative z-10">
            <CozyStudyRoom
              isFocusing={running && mode === 'focus'}
              isBreak={mode !== 'focus'}
              rainActive={ambient.rain > 0}
              fireActive={ambient.fire > 0}
              onToggleRain={() => handleAmbientChange('rain', ambient.rain > 0 ? 0 : 0.4)}
              onToggleFire={() => handleAmbientChange('fire', ambient.fire > 0 ? 0 : 0.35)}
              onPetCat={handlePetCat}
            />

            {/* Cat Purr Toast */}
            <AnimatePresence>
              {catPurring && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-pink-950/80 border border-pink-500/50 text-xs font-bold text-pink-300 shadow-xl"
                >
                  🐱 مياو! القطة تشعر بالدفء وممتنة لمذاكرتك المركزة ❤️
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Bottom Center: Lo-Fi Music Player Bar (From Screenshot) ─── */}
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
            {/* Lofi Stream Controls */}
            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/10" dir="ltr">
              <button
                onClick={() => changeLofiStation(-1)}
                className="text-slate-400 hover:text-white transition-colors"
                title="المحطة السابقة"
              >
                <SkipBack size={15} />
              </button>

              <button
                onClick={toggleLofi}
                className="w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center transition-transform active:scale-90 shadow-md shadow-pink-600/30"
                title={lofiPlaying ? 'إيقاف مؤقت' : 'تشغيل اللوفاي'}
              >
                {lofiPlaying ? <Pause size={15} /> : <Play size={15} className="translate-x-0.5" />}
              </button>

              <button
                onClick={() => changeLofiStation(1)}
                className="text-slate-400 hover:text-white transition-colors"
                title="المحطة التالية"
              >
                <SkipForward size={15} />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 pl-1">
                <Volume1 size={13} className="text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={lofiVolume}
                  onChange={(e) => setLofiVolume(parseFloat(e.target.value))}
                  className="w-14 accent-pink-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Now Playing Info */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 text-xs font-mono font-bold text-slate-200">
                <Radio size={13} className={lofiPlaying ? 'text-pink-400 animate-pulse' : 'text-slate-500'} />
                <span>{currentStation.name}</span>
              </div>
            </div>

            {/* Quick Action Buttons (Presets & Complete) */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Presets */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
                {[25, 45, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPresetMinutes(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      totalSeconds === m * 60
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {`${m}د`}
                  </button>
                ))}
              </div>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 hover:text-white transition-all"
                title="إعادة ضبط المؤقت"
              >
                <RotateCcw size={15} />
              </button>

              {/* Early complete & log XP */}
              {activeSessionId && (
                <button
                  onClick={() => completeSession()}
                  disabled={sessionLoading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 size={14} />
                  <span>إنهاء واحتساب XP</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════ */
        /* 2. CLASSIC PRECISION CHRONOMETER DIAL                              */
        /* ═══════════════════════════════════════════════════════════════════ */
        <div className="panel p-6 sm:p-8 flex flex-col items-center gap-6">
          {/* Mode Switcher (Pill Segmented Selector) */}
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

          {/* Subject Selection */}
          {mode === 'focus' && (
            <div className="flex gap-2 flex-wrap justify-center max-w-md">
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSubject(s.id)
                    handleReset()
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

          {/* Duration Presets */}
          {mode === 'focus' && (
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

          {/* Precision Dial SVG */}
          <div className="relative flex items-center justify-center my-2">
            <div
              className={`absolute w-72 h-72 rounded-full pointer-events-none transition-all duration-1000 ${
                running ? 'bg-emerald-500/15 blur-3xl animate-pulse' : 'bg-slate-800/20 blur-2xl'
              }`}
            />

            <svg width="280" height="280" viewBox="0 0 280 280" className="relative z-10 select-none">
              <defs>
                <linearGradient id="focusProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="60%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              <circle cx="140" cy="140" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle
                cx="140"
                cy="140"
                r={radius}
                fill="none"
                stroke="url(#focusProgressGrad)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 140 140)"
                className="transition-all duration-500"
              />
            </svg>

            {/* Inner Digits - STRICT DIR=LTR FOR MM:SS */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
              <span className="text-[11px] font-bold text-slate-400 mb-1">
                {mode === 'focus' ? subject.name : 'استراحة'}
              </span>
              <div dir="ltr" className="flex items-baseline justify-center font-mono text-5xl font-black text-white tracking-tight">
                <span>{mm}</span>
                <span className="animate-pulse text-emerald-400/80 mx-0.5">:</span>
                <span>{ss}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 font-mono">
                {Math.round(progressFraction * 100)}% مكتمل
              </p>
            </div>
          </div>

          {/* Dial Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-2xl bg-[#141922] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
            >
              <RotateCcw size={18} />
            </button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={toggleRunning}
              disabled={sessionLoading}
              className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl transition-all ${
                running
                  ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/30'
              }`}
            >
              {running ? <Pause size={30} /> : <Play size={30} className="translate-x-0.5" />}
            </motion.button>

            <button
              onClick={addFiveMinutes}
              className="w-12 h-12 rounded-2xl bg-[#141922] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all active:scale-95 text-xs font-bold font-mono"
            >
              +5
            </button>
          </div>
        </div>
      )}

      {/* ─── Goal Modal Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#1e1326] border border-purple-800/60 rounded-3xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Target size={18} className="text-pink-400" />
                  <span>تحديد هدف جلسة المذاكرة</span>
                </h3>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  إغلاق
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={sessionGoal}
                  onChange={(e) => setSessionGoal(e.target.value)}
                  placeholder="مثلاً: حل 10 أسئلة نحو + مراجعة الفصل..."
                  className="w-full p-3 rounded-2xl bg-black/40 border border-purple-500/40 text-xs text-white placeholder-slate-500 outline-none focus:border-pink-500"
                  dir="auto"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    حفظ الهدف
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FocusTimer() {
  return (
    <Suspense
      fallback={
        <div className="text-slate-500 text-center py-16 text-sm">
          جاري تحميل استوديو التركيز...
        </div>
      }
    >
      <TimerContent />
    </Suspense>
  )
}
