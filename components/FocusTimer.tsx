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
  Shuffle,
  Snowflake,
  ArrowRight,
  Rocket,
  Box,
  Home,
  Clock,
  Repeat,
  Heart,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { SUBJECTS } from '@/lib/types'
import { useSearchParams } from 'next/navigation'
import CozyStudyRoom from '@/components/CozyStudyRoom'
import MinecraftStudyRoom from '@/components/MinecraftStudyRoom'
import SpaceStudyRoom from '@/components/SpaceStudyRoom'
import { soundscapeEngine } from '@/lib/soundscapes'
import { SubjectIcon, getSubjectTheme } from '@/components/AcademicIcons'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
type StudioMode = 'space' | 'minecraft' | 'cozy' | 'dial'

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

  // ── View Mode: 'space' (3D Starship Flight), 'minecraft' (4K Rainy Cottage), 'cozy' (Isometric), or 'dial' ──
  const [studioMode, setStudioMode] = useState<StudioMode>('space')
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

  // Sync Fullscreen state with native browser events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
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
      if (savedMode === 'space' || savedMode === 'minecraft' || savedMode === 'cozy' || savedMode === 'dial') {
        setStudioMode(savedMode as StudioMode)
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
          const resJson = await res.json()
          if (resJson.success) {
            const data = resJson.data || resJson
            setEarnedXp(resJson.xpEarned || data?.xp_earned || data?.xpEarned || estXpReward)
            setSessionStats({
              streak: resJson.streak || data?.current_streak || data?.streak || 2,
              hours: resJson.totalHours || data?.total_hours || data?.totalHours || 2.5,
              message: resJson.message || data?.message,
              rewards: resJson.rewards || data?.rewards,
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
      className={`relative w-full transition-colors duration-200 ${
        studioMode === 'space' || studioMode === 'minecraft'
          ? 'w-full h-[100dvh] min-h-screen overflow-hidden bg-[#0A0B0E]'
          : isFullscreen
          ? 'fixed inset-0 z-50 bg-[#0A0B0E] p-4 sm:p-8 flex flex-col justify-between overflow-y-auto'
          : 'min-h-screen bg-[#0A0B0E] px-4 sm:px-6 pt-5 pb-10 space-y-5 max-w-5xl mx-auto overflow-y-auto max-h-[100dvh]'
      }`}
    >
      {/* Hidden Lo-Fi Stream Audio Element */}
      <audio ref={audioRef} src={currentStation.url} preload="none" />

      {/* ─── Mode Switcher Bar (Only in Cozy / Dial Mode) ─────── */}
      {studioMode !== 'space' && studioMode !== 'minecraft' && (
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-[12px] bg-[#12141C] border border-[rgba(236,238,242,0.10)] shadow-md">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#191C25] hover:bg-[#202430] text-[#ECEEF2] text-xs font-semibold transition-colors border border-[rgba(236,238,242,0.10)] min-h-[38px]"
              title="العودة للصفحة الرئيسية"
            >
              <ArrowRight size={14} />
              <span className="hidden sm:inline">الرئيسية</span>
            </Link>

            {/* 1. Space 3D */}
            <button
              type="button"
              onClick={() => {
                setStudioMode('space')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'space')
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold text-[#9CA3AF] hover:text-[#ECEEF2] hover:bg-[#191C25] transition-colors min-h-[38px]"
            >
              <Rocket size={14} />
              <span>رحلة الفضاء 3D</span>
            </button>

            {/* 2. Minecraft 4K Rainy Cottage */}
            <button
              type="button"
              onClick={() => {
                setStudioMode('minecraft')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'minecraft')
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold text-[#9CA3AF] hover:text-[#ECEEF2] hover:bg-[#191C25] transition-colors min-h-[38px]"
            >
              <Box size={14} />
              <span>كوخ ماين كرافت 4K</span>
            </button>

            {/* 3. Isometric Cozy Studio */}
            <button
              type="button"
              onClick={() => {
                setStudioMode('cozy')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'cozy')
                } catch {}
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold transition-colors min-h-[38px] ${
                studioMode === 'cozy'
                  ? 'bg-[#D4AF37] text-[#0A0B0E]'
                  : 'text-[#9CA3AF] hover:text-[#ECEEF2] hover:bg-[#191C25]'
              }`}
            >
              <Home size={14} />
              <span>استوديو اللوفاي</span>
            </button>

            {/* 4. Precision Dial */}
            <button
              type="button"
              onClick={() => {
                setStudioMode('dial')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'dial')
                } catch {}
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold transition-colors min-h-[38px] ${
                studioMode === 'dial'
                  ? 'bg-[#D4AF37] text-[#0A0B0E]'
                  : 'text-[#9CA3AF] hover:text-[#ECEEF2] hover:bg-[#191C25]'
              }`}
            >
              <Clock size={14} />
              <span>قرص التوقيت</span>
            </button>
          </div>

          {/* Fullscreen & Timer Mode Indicator */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
              className="w-9 h-9 rounded-[8px] bg-[#191C25] hover:bg-[#202430] text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors border border-[rgba(236,238,242,0.10)] flex items-center justify-center"
              title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. SPACE ODYSSEY 3D REAL FLIGHT DECK (NEW FLAGSHIP EXPERIENCE!)     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {studioMode === 'space' ? (
        <div className="relative w-full h-full min-h-screen overflow-hidden">
          {/* Subtle Floating Mode Switcher for Space Mode */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1 rounded-[12px] bg-[#0A0B0E]/88 backdrop-blur-md border border-[rgba(236,238,242,0.14)] shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setStudioMode('space')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'space')
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold bg-[#D4AF37] text-[#0A0B0E] transition-colors"
            >
              <Rocket size={13} />
              <span>الفضاء 3D</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStudioMode('minecraft')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'minecraft')
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            >
              <Box size={13} />
              <span>ماين كرافت</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStudioMode('cozy')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'cozy')
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            >
              <Home size={13} />
              <span>اللوفاي</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStudioMode('dial')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'dial')
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            >
              <Clock size={13} />
              <span>القرص</span>
            </button>
          </div>

          <SpaceStudyRoom
            running={running}
            remaining={remaining}
            totalSeconds={totalSeconds}
            mode={mode}
            completedCycles={completedCycles}
            subject={subject}
            isFullscreen={isFullscreen}
            activeSessionId={activeSessionId}
            sessionLoading={sessionLoading}
            finished={finished}
            earnedXp={earnedXp}
            sessionStats={sessionStats}
            onToggleRunning={toggleRunning}
            onReset={handleReset}
            onSetPreset={setPresetMinutes}
            onAddFiveMinutes={addFiveMinutes}
            onCompleteSession={() => completeSession()}
            onToggleFullscreen={toggleFullscreen}
            onSelectSubject={(id) => {
              setSelectedSubject(id)
              saveStoredPomodoro({ selectedSubject: id })
            }}
            onCloseCompletionModal={() => {
              setFinished(false)
              setEarnedXp(null)
              setSessionStats(null)
            }}
          />
        </div>
      ) : studioMode === 'minecraft' ? (
        <div className="relative w-full h-full min-h-screen overflow-hidden">
          {/* Subtle Floating Mode Switcher for Minecraft Mode */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1 rounded-[12px] bg-[#0A0B0E]/88 backdrop-blur-md border border-[rgba(236,238,242,0.14)] shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setStudioMode('space')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'space')
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            >
              <Rocket size={13} />
              <span>الفضاء</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStudioMode('minecraft')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'minecraft')
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold bg-[#D4AF37] text-[#0A0B0E] transition-colors"
            >
              <Box size={13} />
              <span>ماين كرافت 4K</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStudioMode('cozy')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'cozy')
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            >
              <Home size={13} />
              <span>اللوفاي</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStudioMode('dial')
                try {
                  localStorage.setItem('aegis_focus_studio_mode', 'dial')
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            >
              <Clock size={13} />
              <span>القرص</span>
            </button>
          </div>

          <MinecraftStudyRoom
            running={running}
            remaining={remaining}
            totalSeconds={totalSeconds}
            mode={mode}
            completedCycles={completedCycles}
            subject={subject}
            isFullscreen={isFullscreen}
            activeSessionId={activeSessionId}
            sessionLoading={sessionLoading}
            finished={finished}
            earnedXp={earnedXp}
            sessionStats={sessionStats}
            onToggleRunning={toggleRunning}
            onReset={handleReset}
            onSetPreset={setPresetMinutes}
            onAddFiveMinutes={addFiveMinutes}
            onCompleteSession={() => completeSession()}
            onToggleFullscreen={toggleFullscreen}
            onSelectSubject={(id) => {
              setSelectedSubject(id)
              saveStoredPomodoro({ selectedSubject: id })
            }}
            onCloseCompletionModal={() => {
              setFinished(false)
              setEarnedXp(null)
              setSessionStats(null)
            }}
            onOpenMixer={() => setShowMixer(!showMixer)}
          />

          {/* Ambient Sound Mixer Drawer Overlay for Minecraft Mode */}
          <AnimatePresence>
            {showMixer && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-16 right-4 sm:top-20 sm:right-6 z-40 p-3.5 rounded-[12px] bg-[#0D0F15]/92 backdrop-blur-md border border-[rgba(236,238,242,0.14)] shadow-2xl flex flex-col gap-2.5 w-36 sm:w-40 text-[#ECEEF2]"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-[rgba(236,238,242,0.08)]">
                  <span className="text-[11px] font-semibold text-[#D4AF37]">Sound Mixer</span>
                  <button
                    type="button"
                    onClick={() => setShowMixer(false)}
                    aria-label="إغلاق مازج الصوت"
                    className="text-[#9CA3AF] hover:text-[#ECEEF2] p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
                {/* Rain */}
                <div className="flex items-center gap-2">
                  <CloudRain size={15} className={ambient.rain > 0 ? 'text-[#5D8AA8]' : 'text-[#7D8594]'} />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambient.rain}
                    onChange={(e) => handleAmbientChange('rain', parseFloat(e.target.value))}
                    className="w-full accent-[#D4AF37] h-1.5 bg-[#191C25] rounded-full cursor-pointer"
                    title="صوت المطر"
                  />
                </div>
                {/* Snow / Blizzard */}
                <div className="flex items-center gap-2">
                  <Snowflake size={15} className={ambient.brown > 0 ? 'text-[#9CA3AF]' : 'text-[#7D8594]'} />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambient.brown}
                    onChange={(e) => handleAmbientChange('brown', parseFloat(e.target.value))}
                    className="w-full accent-[#D4AF37] h-1.5 bg-[#191C25] rounded-full cursor-pointer"
                    title="عاصفة ثلجية"
                  />
                </div>
                {/* Wind */}
                <div className="flex items-center gap-2">
                  <Wind size={15} className={ambient.wind > 0 ? 'text-[#937CB8]' : 'text-[#7D8594]'} />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambient.wind}
                    onChange={(e) => handleAmbientChange('wind', parseFloat(e.target.value))}
                    className="w-full accent-[#D4AF37] h-1.5 bg-[#191C25] rounded-full cursor-pointer"
                    title="الرياح"
                  />
                </div>
                {/* Fire */}
                <div className="flex items-center gap-2">
                  <Flame size={15} className={ambient.fire > 0 ? 'text-[#C88A36]' : 'text-[#7D8594]'} />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambient.fire}
                    onChange={(e) => handleAmbientChange('fire', parseFloat(e.target.value))}
                    className="w-full accent-[#D4AF37] h-1.5 bg-[#191C25] rounded-full cursor-pointer"
                    title="حطب المدفأة"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : studioMode === 'cozy' ? (
        /* ═══════════════════════════════════════════════════════════════════ */
        /* 2. COZY LOFI STUDY ROOM (MATCHING USER REFERENCE SCREENSHOT 1)      */
        /* ═══════════════════════════════════════════════════════════════════ */
        <div
          className={`relative w-full bg-[#12141C] text-[#ECEEF2] flex flex-col justify-between select-none transition-colors duration-200 ${
            isFullscreen
              ? 'fixed inset-0 z-50 w-screen h-[100dvh] p-4 sm:p-8 rounded-none border-none overflow-hidden'
              : 'rounded-[16px] border border-[rgba(236,238,242,0.10)] shadow-2xl p-3 sm:p-6 min-h-[calc(100dvh-110px)] overflow-hidden'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 48%, rgba(212, 175, 55, 0.055) 0%, transparent 62%)',
          }}
        >
          {/* ─── Top Left: Activity & Timer Status ─── */}
          <div
            className={`absolute z-30 flex flex-col text-left ${
              isFullscreen ? 'top-6 left-6 sm:top-8 sm:left-8 gap-2.5' : 'top-4 left-4 sm:top-6 sm:left-6 gap-1.5'
            }`}
            dir="ltr"
          >
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleRunning}
                aria-label={running ? 'إيقاف مؤقت' : 'بدء التركيز'}
                className={`rounded-[10px] bg-[#0A0B0E]/80 hover:bg-[#191C25] border border-[rgba(236,238,242,0.16)] flex items-center justify-center text-[#D4AF37] transition-colors ${
                  isFullscreen ? 'w-11 h-11' : 'w-8 h-8 sm:w-9 sm:h-9'
                }`}
                title={running ? 'إيقاف مؤقت' : 'بدء التركيز'}
              >
                {running ? (
                  <Pause size={isFullscreen ? 18 : 14} />
                ) : (
                  <Play size={isFullscreen ? 18 : 14} className="translate-x-0.5" />
                )}
              </button>
              <div
                className={`flex items-center gap-1.5 font-semibold text-[#ECEEF2] ${
                  isFullscreen ? 'text-sm sm:text-base' : 'text-xs'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${running ? 'bg-[#4EA87E]' : 'bg-[#D4AF37]'}`} />
                <span>{mode === 'focus' ? 'Activity' : 'Break'}</span>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 font-tabular font-bold text-[#ECEEF2] pl-1 ${
                isFullscreen ? 'text-base sm:text-lg' : 'text-xs'
              }`}
            >
              <Repeat size={13} className="text-[#D4AF37]" />
              <span
                className={`font-bold text-[#ECEEF2] tracking-wide ${
                  isFullscreen ? 'text-2xl sm:text-4xl' : 'text-sm sm:text-base'
                }`}
              >
                {`${mm}:${ss}`}
              </span>
              <span className={`text-[#9CA3AF] font-normal ${isFullscreen ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
                {running ? `${Math.ceil(remaining / 60)} min left` : 'paused'}
              </span>
            </div>

            {/* Current Active Subject Tag */}
            <div className="pt-0.5">
              <span
                dir="rtl"
                className={`inline-flex items-center gap-1.5 rounded-[8px] bg-[#0A0B0E]/80 border border-[rgba(236,238,242,0.12)] font-semibold text-[#ECEEF2] ${
                  isFullscreen ? 'px-3.5 py-1.5 text-xs sm:text-sm' : 'px-2.5 py-1 text-[11px]'
                }`}
              >
                <SubjectIcon subjectId={subject.id} size={13} />
                <span>{subject.name}</span>
              </span>
            </div>
          </div>

          {/* ─── Top Right: Clock, Quick Buttons & Sound Mixer Panel ─── */}
          <div
            className={`absolute z-30 flex flex-col items-end ${
              isFullscreen ? 'top-6 right-6 sm:top-8 sm:right-8 gap-3.5' : 'top-4 right-4 sm:top-6 sm:right-6 gap-2.5'
            }`}
          >
            {/* Digital Clock (HH:MM | AM/PM) Capsule */}
            <div
              dir="ltr"
              className={`flex items-center gap-2 bg-[#0A0B0E]/80 border border-[rgba(236,238,242,0.14)] font-tabular font-semibold text-[#ECEEF2] backdrop-blur-md select-none ${
                isFullscreen ? 'px-4 py-2 rounded-[10px] text-sm sm:text-base' : 'px-3 py-1.5 rounded-[8px] text-xs'
              }`}
            >
              <span>{clockTime.split(' ')[0] || '15:11'}</span>
              <span className="text-[#6B7280] text-xs">|</span>
              <span className="text-[#D4AF37]">{clockTime.split(' ')[1] || 'PM'}</span>
            </div>

            {/* Quick Actions (Goal/Tasks, Fullscreen) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(true)}
                aria-label="تحديد هدف الجلسة"
                className={`bg-[#0A0B0E]/80 hover:bg-[#191C25] border border-[rgba(236,238,242,0.14)] flex items-center justify-center text-[#ECEEF2] transition-colors ${
                  isFullscreen
                    ? 'w-11 h-11 rounded-[10px]'
                    : 'w-9 h-9 rounded-[8px]'
                }`}
                title="تحديد هدف الجلسة"
              >
                <ListTodo size={isFullscreen ? 18 : 15} className="text-[#D4AF37]" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
                className={`bg-[#0A0B0E]/80 hover:bg-[#191C25] border border-[rgba(236,238,242,0.14)] flex items-center justify-center text-[#ECEEF2] transition-colors ${
                  isFullscreen
                    ? 'w-11 h-11 rounded-[10px]'
                    : 'w-9 h-9 rounded-[8px]'
                }`}
                title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة بالكامل'}
              >
                {isFullscreen ? (
                  <Minimize2 size={isFullscreen ? 18 : 15} />
                ) : (
                  <Maximize2 size={isFullscreen ? 18 : 15} />
                )}
              </button>
            </div>

            {/* ─── Ambient Sound Mixer Vertical Panel ──── */}
            <div
              className={`bg-[#0A0B0E]/85 backdrop-blur-md border border-[rgba(236,238,242,0.14)] shadow-xl flex flex-col ${
                isFullscreen
                  ? 'p-3.5 sm:p-4 rounded-[12px] gap-3 w-36 sm:w-44'
                  : 'p-2.5 rounded-[10px] gap-2.5 w-28 sm:w-32'
              }`}
            >
              {/* Rain */}
              <div className="flex items-center gap-2 px-1">
                <CloudRain
                  size={isFullscreen ? 17 : 15}
                  className={`shrink-0 ${ambient.rain > 0 ? 'text-[#5D8AA8]' : 'text-[#7D8594]'}`}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambient.rain}
                  onChange={(e) => handleAmbientChange('rain', parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer bg-[#191C25] rounded-full h-1.5"
                  title="صوت المطر"
                />
              </div>

              {/* Snow / Cold Noise */}
              <div className="flex items-center gap-2 px-1">
                <Snowflake
                  size={isFullscreen ? 17 : 15}
                  className={`shrink-0 ${ambient.brown > 0 ? 'text-[#9CA3AF]' : 'text-[#7D8594]'}`}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambient.brown}
                  onChange={(e) => handleAmbientChange('brown', parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer bg-[#191C25] rounded-full h-1.5"
                  title="عاصفة ثلجية وهدوء تام"
                />
              </div>

              {/* Wind */}
              <div className="flex items-center gap-2 px-1">
                <Wind
                  size={isFullscreen ? 17 : 15}
                  className={`shrink-0 ${ambient.wind > 0 ? 'text-[#937CB8]' : 'text-[#7D8594]'}`}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambient.wind}
                  onChange={(e) => handleAmbientChange('wind', parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer bg-[#191C25] rounded-full h-1.5"
                  title="نسيم الرياح"
                />
              </div>

              {/* Fire */}
              <div className="flex items-center gap-2 px-1">
                <Flame
                  size={isFullscreen ? 17 : 15}
                  className={`shrink-0 ${ambient.fire > 0 ? 'text-[#C88A36]' : 'text-[#7D8594]'}`}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambient.fire}
                  onChange={(e) => handleAmbientChange('fire', parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer bg-[#191C25] rounded-full h-1.5"
                  title="حطب المدفأة"
                />
              </div>
            </div>
          </div>

          {/* ─── Centerpiece: Isometric Cozy Study Cabin Artwork ─── */}
          <div className="flex-1 w-full flex items-center justify-center my-auto relative z-10 py-1">
            <CozyStudyRoom
              isFocusing={running && mode === 'focus'}
              isBreak={mode !== 'focus'}
              rainActive={ambient.rain > 0}
              fireActive={ambient.fire > 0}
              isFullscreen={isFullscreen}
              onToggleRain={() => handleAmbientChange('rain', ambient.rain > 0 ? 0 : 0.4)}
              onToggleFire={() => handleAmbientChange('fire', ambient.fire > 0 ? 0 : 0.35)}
              onPetCat={handlePetCat}
            />

            {/* Cat Purr Toast */}
            <AnimatePresence>
              {catPurring && (
                <motion.div
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-[10px] bg-[#191C25] border border-[rgba(212,175,55,0.40)] text-xs font-semibold text-[#ECEEF2] shadow-2xl z-30 flex items-center gap-2 whitespace-nowrap"
                >
                  <Heart size={13} className="text-[#D4AF37] fill-[#D4AF37]" />
                  <span>القطة تشعر بالدفء وترافقك في جلسة التركيز</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Bottom Center: Lo-Fi Music Player Bar ─── */}
          <div
            className={`relative z-20 flex flex-col items-center justify-center gap-3 border-t border-[rgba(236,238,242,0.08)] ${
              isFullscreen ? 'pt-5 pb-2' : 'pt-3'
            }`}
          >
            {/* Centered Lofi Player */}
            <div className="flex flex-col items-center gap-1.5" dir="ltr">
              <div
                className={`flex items-center bg-[#0A0B0E]/85 rounded-[10px] border border-[rgba(236,238,242,0.14)] backdrop-blur-md ${
                  isFullscreen ? 'px-5 py-2.5 gap-4' : 'px-3.5 py-1.5 gap-3'
                }`}
              >
                <button
                  type="button"
                  onClick={toggleLofi}
                  aria-label={lofiPlaying ? 'إيقاف مؤقت' : 'تشغيل اللوفاي'}
                  className={`rounded-[8px] bg-[#191C25] hover:bg-[#202430] text-[#ECEEF2] flex items-center justify-center transition-colors ${
                    isFullscreen ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-8 h-8'
                  }`}
                  title={lofiPlaying ? 'إيقاف مؤقت' : 'تشغيل اللوفاي'}
                >
                  {lofiPlaying ? (
                    <Pause size={isFullscreen ? 16 : 14} />
                  ) : (
                    <Play size={isFullscreen ? 16 : 14} className="translate-x-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => changeLofiStation(1)}
                  aria-label="المحطة التالية"
                  className={`rounded-[8px] bg-[#191C25] hover:bg-[#202430] text-[#9CA3AF] hover:text-[#ECEEF2] flex items-center justify-center transition-colors ${
                    isFullscreen ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-8 h-8'
                  }`}
                  title="المحطة التالية"
                >
                  <Shuffle size={isFullscreen ? 16 : 14} />
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={lofiVolume}
                  onChange={(e) => setLofiVolume(parseFloat(e.target.value))}
                  className={`accent-[#D4AF37] bg-[#191C25] rounded-full cursor-pointer ${
                    isFullscreen ? 'w-28 sm:w-36 h-1.5' : 'w-24 h-1.5'
                  }`}
                  title="مستوى الصوت"
                />
              </div>

              <p
                className={`font-tabular font-medium text-[#9CA3AF] select-none ${
                  isFullscreen ? 'text-xs sm:text-sm' : 'text-[11px]'
                }`}
              >
                {currentStation.name}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <div
                className={`flex items-center p-1 rounded-[10px] bg-[#0A0B0E]/85 border border-[rgba(236,238,242,0.12)] ${
                  isFullscreen ? 'gap-1.5' : 'gap-1'
                }`}
              >
                {[25, 45, 60].map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPresetMinutes(m)}
                    className={`rounded-[7px] font-semibold font-tabular transition-colors ${
                      isFullscreen ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
                    } ${
                      totalSeconds === m * 60
                        ? 'bg-[#D4AF37] text-[#0A0B0E]'
                        : 'text-[#9CA3AF] hover:text-[#ECEEF2]'
                    }`}
                  >
                    {`${m}د`}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={addFiveMinutes}
                  className={`rounded-[7px] font-semibold font-tabular text-[#9CA3AF] hover:text-[#ECEEF2] hover:bg-[#191C25] transition-colors ${
                    isFullscreen ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
                  }`}
                  title="إضافة 5 دقائق"
                >
                  +5د
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                aria-label="إعادة ضبط المؤقت"
                className={`rounded-[10px] bg-[#0A0B0E]/85 hover:bg-[#191C25] border border-[rgba(236,238,242,0.12)] text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors ${
                  isFullscreen ? 'p-2.5 sm:p-3' : 'p-2'
                }`}
                title="إعادة ضبط المؤقت"
              >
                <RotateCcw size={isFullscreen ? 17 : 15} />
              </button>

              {activeSessionId && (
                <button
                  type="button"
                  onClick={() => completeSession()}
                  disabled={sessionLoading}
                  className={`flex items-center gap-1.5 rounded-[10px] bg-[#D4AF37] hover:bg-[#E0C058] text-[#0A0B0E] font-semibold transition-colors ${
                    isFullscreen ? 'px-4 py-2 text-sm' : 'px-3.5 py-2 text-xs'
                  }`}
                >
                  <CheckCircle2 size={isFullscreen ? 17 : 14} />
                  <span>إنهاء واحتساب XP</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════ */
        /* 4. DARK ACADEMIC PRECISION CHRONOMETER DIAL                        */
        /* ═══════════════════════════════════════════════════════════════════ */
        <div className="aegis-panel-elevated p-6 sm:p-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-[12px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] max-w-md w-full">
            <button
              type="button"
              onClick={() => switchMode('focus')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] text-xs font-semibold transition-colors min-h-[40px] ${
                mode === 'focus'
                  ? 'bg-[#191C25] text-[#ECEEF2] border border-[rgba(212,175,55,0.35)]'
                  : 'text-[#9CA3AF] hover:text-[#ECEEF2] border border-transparent'
              }`}
            >
              <Brain size={14} className={mode === 'focus' ? 'text-[#D4AF37]' : ''} />
              <span>تركيز عميق</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('shortBreak')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] text-xs font-semibold transition-colors min-h-[40px] ${
                mode === 'shortBreak'
                  ? 'bg-[#191C25] text-[#ECEEF2] border border-[rgba(78,168,126,0.35)]'
                  : 'text-[#9CA3AF] hover:text-[#ECEEF2] border border-transparent'
              }`}
            >
              <Coffee size={14} className={mode === 'shortBreak' ? 'text-[#4EA87E]' : ''} />
              <span>راحة قصيرة</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('longBreak')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] text-xs font-semibold transition-colors min-h-[40px] ${
                mode === 'longBreak'
                  ? 'bg-[#191C25] text-[#ECEEF2] border border-[rgba(200,138,54,0.35)]'
                  : 'text-[#9CA3AF] hover:text-[#ECEEF2] border border-transparent'
              }`}
            >
              <Compass size={14} className={mode === 'longBreak' ? 'text-[#C88A36]' : ''} />
              <span>راحة طويلة</span>
            </button>
          </div>

          {/* Subject Selection */}
          {mode === 'focus' && (
            <div className="flex gap-2 flex-wrap justify-center max-w-lg">
              {SUBJECTS.map((s) => {
                const theme = getSubjectTheme(s.id)
                const isSel = selectedSubject === s.id
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      setSelectedSubject(s.id)
                      handleReset()
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors border min-h-[40px] ${
                      isSel
                        ? `bg-[#12141C] ${theme.border} text-[#ECEEF2]`
                        : 'border-[rgba(236,238,242,0.08)] bg-[#07080B] text-[#9CA3AF] hover:text-[#ECEEF2]'
                    }`}
                  >
                    <SubjectIcon subjectId={s.id} size={14} />
                    <span>{s.name}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Duration Presets */}
          {mode === 'focus' && (
            <div className="flex gap-2 flex-wrap justify-center">
              {FOCUS_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.minutes}
                  onClick={() => setPresetMinutes(p.minutes)}
                  className={`px-3.5 py-1.5 rounded-[8px] text-xs font-semibold font-tabular transition-colors border min-h-[38px] ${
                    totalSeconds === p.minutes * 60
                      ? 'bg-[#D4AF37] text-[#0A0B0E] border-[#E0C058]'
                      : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Horological Precision Dial SVG */}
          <div className="relative flex items-center justify-center my-2">
            <svg width="280" height="280" viewBox="0 0 280 280" className="relative z-10 select-none">
              <defs>
                <linearGradient id="focusProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B89427" />
                  <stop offset="55%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#E0C058" />
                </linearGradient>
              </defs>

              <circle cx="140" cy="140" r={radius} fill="none" stroke="#07080B" strokeWidth="10" />
              <circle cx="140" cy="140" r={radius} fill="none" stroke="rgba(236,238,242,0.08)" strokeWidth="1" />
              <circle
                cx="140"
                cy="140"
                r={radius}
                fill="none"
                stroke="url(#focusProgressGrad)"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 140 140)"
                className="transition-all duration-500"
              />
            </svg>

            {/* Inner Digits - STRICT DIR=LTR FOR MM:SS */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
              <span className="text-xs font-semibold text-[#9CA3AF] mb-1.5">
                {mode === 'focus' ? subject.name : 'استراحة'}
              </span>
              <div dir="ltr" className="flex items-baseline justify-center font-tabular text-5xl font-bold text-[#ECEEF2] tracking-tight">
                <span>{mm}</span>
                <span className="text-[#D4AF37] mx-0.5">:</span>
                <span>{ss}</span>
              </div>
              <p className="text-[11px] font-medium text-[#7D8594] mt-2 font-tabular">
                <span dir="ltr">{Math.round(progressFraction * 100)}%</span> مكتمل
              </p>
            </div>
          </div>

          {/* Dial Controls */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              aria-label="إعادة ضبط المؤقت"
              className="w-12 h-12 rounded-[10px] bg-[#12141C] border border-[rgba(236,238,242,0.12)] hover:border-[rgba(236,238,242,0.24)] flex items-center justify-center text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors"
            >
              <RotateCcw size={18} />
            </button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={toggleRunning}
              disabled={sessionLoading}
              aria-label={running ? 'إيقاف مؤقت' : 'بدء التركيز'}
              className={`w-18 h-18 rounded-[16px] flex items-center justify-center shadow-lg transition-colors ${
                running
                  ? 'bg-[#12141C] hover:bg-[#202430] text-[#D4AF37] border border-[rgba(212,175,55,0.45)]'
                  : 'bg-[#D4AF37] hover:bg-[#E0C058] text-[#0A0B0E]'
              }`}
            >
              {running ? <Pause size={26} /> : <Play size={26} className="translate-x-0.5" />}
            </motion.button>

            <button
              type="button"
              onClick={addFiveMinutes}
              aria-label="إضافة 5 دقائق"
              className="w-12 h-12 rounded-[10px] bg-[#12141C] border border-[rgba(236,238,242,0.12)] hover:border-[rgba(212,175,55,0.35)] flex items-center justify-center text-[#9CA3AF] hover:text-[#D4AF37] transition-colors text-xs font-bold font-tabular"
            >
              +5
            </button>
          </div>
        </div>
      )}

      {/* ─── Goal Modal Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(6,7,10,0.82)] backdrop-blur-md">
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label="تحديد هدف جلسة المذاكرة"
              className="w-full max-w-md bg-[#191C25] border border-[rgba(236,238,242,0.14)] rounded-[16px] p-5 sm:p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(236,238,242,0.08)]">
                <h3 className="text-sm sm:text-base font-bold text-[#ECEEF2] flex items-center gap-2">
                  <Target size={17} className="text-[#D4AF37]" />
                  <span>تحديد هدف جلسة المذاكرة</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  aria-label="إغلاق"
                  className="text-[#9CA3AF] hover:text-[#ECEEF2] text-xs font-semibold px-2 py-1"
                >
                  إغلاق
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={sessionGoal}
                  onChange={(e) => setSessionGoal(e.target.value)}
                  placeholder="مثلاً: حل 10 أسئلة نحو + مراجعة الفصل..."
                  className="w-full px-3.5 h-11 rounded-[10px] bg-[#07080B] border border-[rgba(236,238,242,0.12)] text-sm text-[#ECEEF2] placeholder-[#6B7280] focus:border-[#D4AF37]"
                  dir="auto"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="px-5 py-2.5 rounded-[10px] bg-[#D4AF37] hover:bg-[#E0C058] text-[#0A0B0E] font-semibold text-xs transition-colors min-h-[40px]"
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
