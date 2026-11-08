'use client'

import { motion } from 'framer-motion'

interface Props {
  isFocusing: boolean
  isBreak: boolean
  rainActive: boolean
  fireActive: boolean
  isFullscreen?: boolean
  onToggleRain?: () => void
  onToggleFire?: () => void
  onPetCat?: () => void
}

export default function CozyStudyRoom({
  isFocusing,
  isBreak,
  rainActive,
  fireActive,
  isFullscreen = false,
  onToggleRain,
  onToggleFire,
  onPetCat,
}: Props) {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      {/* ─── Tightly-wrapped House Container: Scales Directly with Screen Height ─── */}
      <div
        className={`relative inline-block my-auto flex items-center justify-center transition-all duration-300 ${
          isFullscreen
            ? 'h-[76vh] sm:h-[83vh] max-h-[960px]'
            : 'h-[64vh] sm:h-[72vh] md:h-[76vh] max-h-[820px]'
        }`}
      >
        {/* ─── Ultra HD 3D Isometric Cabin Artwork (Tight-crop, Full Vertical Scale) ─── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/lofi-house-tight-hd.png"
          alt="Cozy Study Room 3D Artwork"
          className="h-full w-auto object-contain select-none pointer-events-none drop-shadow-[0_25px_60px_rgba(0,0,0,0.65)]"
        />

        {/* ─── Interactive Overlay Hotspots Locked to the House Artwork ─────── */}
        <div className="absolute inset-0 pointer-events-auto">
          {/* ─── 1. Fireplace Warm Glow & Rising Sparks ───────────────────── */}
          {fireActive && (
            <div
              onClick={onToggleFire}
              className="absolute cursor-pointer transition-opacity duration-500"
              style={{
                left: '3.4%',
                top: '57.3%',
                width: '10.2%',
                height: '14.5%',
              }}
              title="انقر لتشغيل/إيقاف صوت المدفأة"
            >
              {/* Pulsing Hearth Core Glow */}
              <motion.div
                animate={{
                  opacity: [0.7, 1, 0.75, 1, 0.7],
                  scale: [0.95, 1.12, 0.98, 1.06, 0.95],
                }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="w-full h-full rounded-full bg-gradient-to-t from-amber-500/80 via-orange-500/50 to-transparent blur-[8px]"
              />

              {/* Rising Animated Embers */}
              <motion.span
                animate={{ y: [0, -28], opacity: [1, 0], x: [0, 4] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeOut' }}
                className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_#fef08a]"
              />
              <motion.span
                animate={{ y: [0, -32], opacity: [1, 0], x: [0, -4] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.3, ease: 'easeOut' }}
                className="absolute bottom-3 right-2 w-1.5 h-1.5 rounded-full bg-orange-200 shadow-[0_0_8px_#fb923c]"
              />
            </div>
          )}

          {/* ─── 2. Window Rain Streaks Overlay ───────────────────────────── */}
          <div
            onClick={onToggleRain}
            className="absolute cursor-pointer"
            style={{
              left: '15.3%',
              top: '30.8%',
              width: '12.9%',
              height: '16.9%',
            }}
            title="انقر لتشغيل/إيقاف صوت المطر"
          >
            {rainActive && (
              <svg className="w-full h-full pointer-events-none opacity-90" viewBox="0 0 50 80">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.line
                    key={i}
                    x1={6 + i * 9}
                    y1={4}
                    x2={3 + i * 9}
                    y2={22}
                    stroke="#7dd3fc"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    animate={{ y1: [4, 60], y2: [22, 78], opacity: [0.3, 0.95, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.65 + i * 0.12,
                      ease: 'linear',
                    }}
                  />
                ))}
              </svg>
            )}
          </div>

          {/* ─── 3. Laptop Screen Subtle Ambient Light ─────────────────────── */}
          <motion.div
            animate={{ opacity: isFocusing ? [0.55, 0.9, 0.55] : 0.35 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="absolute pointer-events-none rounded-full bg-sky-400/40 blur-[12px]"
            style={{
              left: '18.6%',
              top: '47.7%',
              width: '11.9%',
              height: '8.4%',
            }}
          />

          {/* ─── 4. Fairy Lights Twinkle Overlay ──────────────────────────── */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '14.6%',
              top: '26.0%',
              width: '17.6%',
              height: '4.5%',
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
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}` }}
                />
              ))}
            </div>
          </div>

          {/* ─── 5. Sleeping Cat Hotspot (Click to Pet & Purr) ─────────────── */}
          <button
            onClick={onPetCat}
            className="absolute cursor-pointer transition-transform active:scale-90 focus:outline-none"
            style={{
              left: '32.2%',
              top: '70.6%',
              width: '20.3%',
              height: '10.8%',
            }}
            title="انقر لمداعبة القطة النائمة 🐱"
          >
            {/* Subtle breathing animation ring */}
            <motion.div
              animate={{ scale: [0.96, 1.05, 0.96] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="w-full h-full rounded-full hover:ring-2 hover:ring-pink-300/40"
            />
          </button>
        </div>
      </div>
    </div>
  )
}
