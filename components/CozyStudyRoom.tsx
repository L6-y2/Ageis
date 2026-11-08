'use client'

import { motion } from 'framer-motion'

interface Props {
  isFocusing: boolean
  isBreak: boolean
  rainActive: boolean
  fireActive: boolean
  onToggleRain?: () => void
  onToggleFire?: () => void
  onPetCat?: () => void
}

export default function CozyStudyRoom({
  isFocusing,
  isBreak,
  rainActive,
  fireActive,
  onToggleRain,
  onToggleFire,
  onPetCat,
}: Props) {
  return (
    <div className="relative w-full aspect-[16/9] max-w-4xl mx-auto flex items-center justify-center select-none overflow-hidden rounded-2xl bg-[#572c47]">
      {/* ─── 1. The Real Aesthetic 3D Isometric Illustration ─────────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/lofi-room-clean.png"
        alt="Cozy Study Room Artwork"
        className="w-full h-full object-contain select-none pointer-events-none drop-shadow-2xl"
      />

      {/* ─── 2. Interactive Hotspots & Visual Overlays ────────────────────── */}
      <div className="absolute inset-0 pointer-events-auto">
        {/* ─── Fireplace Hearth Warm Glow & Rising Sparks ─────────────────── */}
        {fireActive && (
          <div
            onClick={onToggleFire}
            className="absolute cursor-pointer transition-opacity duration-500"
            style={{
              left: '36.8%',
              top: '55%',
              width: '5.5%',
              height: '11%',
            }}
            title="انقر لتشغيل/إيقاف صوت المدفأة"
          >
            {/* Pulsing Hearth Core Glow */}
            <motion.div
              animate={{
                opacity: [0.65, 0.95, 0.7, 1, 0.65],
                scale: [0.95, 1.08, 0.98, 1.05, 0.95],
              }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="w-full h-full rounded-full bg-gradient-to-t from-amber-500/80 via-orange-500/50 to-transparent blur-[6px]"
            />

            {/* Rising Animated Embers */}
            <motion.span
              animate={{ y: [0, -18], opacity: [1, 0], x: [0, 2] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'easeOut' }}
              className="absolute bottom-1 left-2 w-1 h-1 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a]"
            />
            <motion.span
              animate={{ y: [0, -22], opacity: [1, 0], x: [0, -2] }}
              transition={{ repeat: Infinity, duration: 1.4, delay: 0.3, ease: 'easeOut' }}
              className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-orange-200 shadow-[0_0_6px_#fb923c]"
            />
          </div>
        )}

        {/* ─── Window Rain Streaks Overlay ─────────────────────────────────── */}
        <div
          onClick={onToggleRain}
          className="absolute cursor-pointer"
          style={{
            left: '40.6%',
            top: '39%',
            width: '4.8%',
            height: '11.5%',
          }}
          title="انقر لتشغيل/إيقاف صوت المطر"
        >
          {rainActive && (
            <svg className="w-full h-full pointer-events-none opacity-85" viewBox="0 0 40 70">
              {[0, 1, 2, 3].map((i) => (
                <motion.line
                  key={i}
                  x1={8 + i * 8}
                  y1={4}
                  x2={5 + i * 8}
                  y2={18}
                  stroke="#7dd3fc"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  animate={{ y1: [4, 52], y2: [18, 66], opacity: [0.3, 0.9, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.7 + i * 0.15,
                    ease: 'linear',
                  }}
                />
              ))}
            </svg>
          )}
        </div>

        {/* ─── Laptop Screen Subtle Ambient Light ──────────────────────────── */}
        <motion.div
          animate={{ opacity: isFocusing ? [0.5, 0.8, 0.5] : 0.3 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute pointer-events-none rounded-full bg-sky-400/30 blur-[8px]"
          style={{
            left: '42.8%',
            top: '49.5%',
            width: '4.2%',
            height: '5%',
          }}
        />

        {/* ─── Fairy Lights Twinkle Overlay ────────────────────────────────── */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '40%',
            top: '36.5%',
            width: '6.5%',
            height: '3%',
          }}
        >
          <div className="flex items-center justify-between w-full h-full">
            {['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#34d399'].map((c, i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4 + (i % 3) * 0.3,
                  ease: 'easeInOut',
                }}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}` }}
              />
            ))}
          </div>
        </div>

        {/* ─── Sleeping Cat Hotspot (Click to Pet & Purr) ──────────────────── */}
        <button
          onClick={onPetCat}
          className="absolute cursor-pointer transition-transform active:scale-90 focus:outline-none"
          style={{
            left: '46.5%',
            top: '64%',
            width: '6%',
            height: '7%',
          }}
          title="انقر لمداعبة القطة النائمة 🐱"
        >
          {/* Subtle breathing animation ring */}
          <motion.div
            animate={{ scale: [0.96, 1.04, 0.96] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="w-full h-full rounded-full hover:ring-2 hover:ring-pink-300/40"
          />
        </button>
      </div>
    </div>
  )
}
