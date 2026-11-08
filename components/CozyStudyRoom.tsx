'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

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
    <div className="relative w-full max-w-xl mx-auto aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center select-none overflow-hidden rounded-3xl">
      {/* ─── Ambient Glow Halo ────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-pink-950/10 to-slate-950/40 pointer-events-none" />

      {/* ─── Main Isometric SVG Study Cabin Illustration ─────────────── */}
      <svg
        viewBox="0 0 600 520"
        className="w-full h-full drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a1525" />
            <stop offset="100%" stopColor="#2a0815" />
          </linearGradient>

          <linearGradient id="wallInterior" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#43213a" />
            <stop offset="50%" stopColor="#32162b" />
            <stop offset="100%" stopColor="#1e0c1a" />
          </linearGradient>

          <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6e3828" />
            <stop offset="100%" stopColor="#441e15" />
          </linearGradient>

          <linearGradient id="woodBeam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#542e20" />
            <stop offset="100%" stopColor="#371c12" />
          </linearGradient>

          <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="laptopGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#818cf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#ea580c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>

          {/* Filter drop shadow */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ─── 1. CABIN STRUCTURE (ISOMETRIC CUTAWAY) ──────────────────── */}
        {/* Exterior Shell & Roof Trim */}
        <polygon points="300,50 490,170 490,390 300,500 110,390 110,170" fill="url(#roofGrad)" />
        {/* Interior Walls */}
        <polygon points="300,70 475,180 475,380 300,480 125,380 125,180" fill="url(#wallInterior)" />

        {/* Back Wall Split / Corner Seam */}
        <line x1="300" y1="70" x2="300" y2="350" stroke="#1f0c1a" strokeWidth="4" />

        {/* Wooden Floor (Lower Level) */}
        <polygon points="300,480 475,380 300,340 125,380" fill="url(#floorGrad)" />

        {/* Floor Boards Texture Lines */}
        <line x1="168" y1="370" x2="343" y2="470" stroke="#35160e" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="212" y1="360" x2="387" y2="460" stroke="#35160e" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="256" y1="350" x2="431" y2="450" stroke="#35160e" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* ─── 2. LOFT FLOOR (UPPER LEVEL BEDROOM) ─────────────────────── */}
        {/* Loft Wooden Platform */}
        <polygon points="300,200 475,200 475,225 300,240 280,240 280,200" fill="url(#woodBeam)" />
        <polygon points="280,200 475,200 475,208 280,208" fill="#78350f" />
        <line x1="280" y1="208" x2="475" y2="208" stroke="#92400e" strokeWidth="2" />

        {/* Loft Wooden Ladder */}
        <g id="ladder">
          {/* Rails */}
          <line x1="300" y1="210" x2="280" y2="420" stroke="#1c1917" strokeWidth="6" strokeLinecap="round" />
          <line x1="300" y1="210" x2="280" y2="420" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <line x1="322" y1="210" x2="302" y2="420" stroke="#1c1917" strokeWidth="6" strokeLinecap="round" />
          <line x1="322" y1="210" x2="302" y2="420" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          {/* Rungs */}
          {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((f, i) => (
            <line
              key={i}
              x1={300 - 20 * f}
              y1={210 + 210 * f}
              x2={322 - 20 * f}
              y2={210 + 210 * f}
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
          ))}
        </g>

        {/* Loft Bed & Blanket */}
        <polygon points="340,185 465,185 455,145 350,145" fill="#fda4af" />
        {/* Pillow */}
        <rect x="355" y="130" width="35" height="18" rx="4" fill="#a7f3d0" />
        <rect x="395" y="130" width="40" height="18" rx="4" fill="#fecdd3" />
        {/* Folded Blanket edge */}
        <path d="M 340,185 Q 400,165 465,185 L 465,200 L 340,200 Z" fill="#f43f5e" opacity="0.85" />
        <path d="M 360,185 Q 420,155 455,170" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />

        {/* Circular Moon Window (Loft) */}
        <g id="moonWindow">
          <circle cx="430" cy="115" r="26" fill="#1e1b4b" stroke="#f43f5e" strokeWidth="5" />
          <circle cx="430" cy="115" r="22" fill="url(#moonGlow)" opacity="0.8" />
          <line x1="430" y1="93" x2="430" y2="137" stroke="#4c1d95" strokeWidth="2.5" />
          <line x1="408" y1="115" x2="452" y2="115" stroke="#4c1d95" strokeWidth="2.5" />
        </g>

        {/* Hanging Rafter Plant */}
        <g id="hangingPlant">
          <line x1="260" y1="130" x2="260" y2="165" stroke="#78350f" strokeWidth="1.5" />
          <ellipse cx="260" cy="170" rx="14" ry="7" fill="#451a03" />
          <path d="M 252,170 Q 245,185 248,195 Q 255,188 255,173" fill="#10b981" />
          <path d="M 268,170 Q 275,185 272,195 Q 265,188 265,173" fill="#34d399" />
          <path d="M 260,170 Q 260,192 258,202 Q 263,190 262,173" fill="#059669" />
        </g>

        {/* ─── 3. LOWER LEVEL STUDY AREA (DESK & WINDOW) ───────────────── */}
        {/* Main Study Window (with Rain Animation) */}
        <g id="studyWindow" onClick={onToggleRain} className="cursor-pointer">
          <rect
            x="170"
            y="200"
            width="85"
            height="95"
            fill="#0f172a"
            stroke="#e2e8f0"
            strokeWidth="5"
            rx="4"
          />
          {/* Glass Pane */}
          <rect x="175" y="205" width="75" height="85" fill="#1e293b" opacity="0.95" />
          {/* Window Frame Cross */}
          <line x1="212" y1="205" x2="212" y2="290" stroke="#f8fafc" strokeWidth="3" />
          <line x1="175" y1="247" x2="250" y2="247" stroke="#f8fafc" strokeWidth="3" />

          {/* Animated Falling Rain Outside Window */}
          {rainActive && (
            <g id="rainStreaks" opacity="0.75">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <motion.line
                  key={i}
                  x1={180 + i * 10}
                  y1={208}
                  x2={175 + i * 10}
                  y2={220}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={{ y1: [208, 275], y2: [220, 287] }}
                  transition={{ repeat: Infinity, duration: 0.65 + (i % 3) * 0.15, ease: 'linear' }}
                />
              ))}
            </g>
          )}

          {/* Window Sill */}
          <rect x="165" y="293" width="95" height="7" rx="2" fill="#d97706" />

          {/* Potted Succulent on Window Sill */}
          <rect x="178" y="285" width="9" height="9" rx="1" fill="#ea580c" />
          <circle cx="182" cy="282" r="5" fill="#10b981" />
        </g>

        {/* Fairy Lights String above Window */}
        <g id="fairyLights">
          <path d="M 155,190 Q 220,205 285,190" stroke="#475569" strokeWidth="1.5" fill="none" />
          {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 0.95].map((pos, idx) => {
            const x = 155 + (285 - 155) * pos
            const y = 190 + Math.sin(pos * Math.PI) * 15
            const colors = ['#f43f5e', '#fbbf24', '#38bdf8', '#f43f5e', '#a855f7', '#fbbf24', '#34d399']
            return (
              <motion.circle
                key={idx}
                cx={x}
                cy={y}
                r="3.5"
                fill={colors[idx % colors.length]}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5 + (idx % 3) * 0.4,
                  ease: 'easeInOut',
                }}
              />
            )
          })}
        </g>

        {/* Study Desk (Wood) */}
        <polygon points="150,335 250,335 270,305 170,305" fill="#92400e" />
        <rect x="150" y="335" width="100" height="8" fill="#78350f" />
        {/* Desk Legs */}
        <rect x="155" y="343" width="6" height="60" fill="#451a03" />
        <rect x="238" y="343" width="6" height="60" fill="#451a03" />

        {/* Glowing Laptop Screen & Base */}
        <polygon points="190,328 220,328 217,322 193,322" fill="#64748b" />
        {/* Laptop Screen (Glows!) */}
        <polygon points="192,322 218,322 216,303 194,303" fill="#f8fafc" />
        <ellipse cx="205" cy="312" rx="22" ry="15" fill="url(#laptopGlow)" opacity="0.9" />

        {/* Coffee Mug with Animated Steam */}
        <rect x="175" y="318" width="8" height="10" rx="2" fill="#f97316" />
        <motion.path
          d="M 178,315 Q 176,308 179,302"
          stroke="#e2e8f0"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0, 0.8, 0], y: [0, -5] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
        />

        {/* Student Studying at Desk */}
        <g id="studentFigure">
          {/* Chair */}
          <rect x="220" y="330" width="22" height="4" fill="#a16207" />
          <rect x="222" y="334" width="4" height="45" fill="#713f12" />
          <rect x="238" y="334" width="4" height="45" fill="#713f12" />
          <rect x="240" y="305" width="4" height="28" fill="#a16207" />

          {/* Student Torso (Wearing Cozy Navy Hoodie) */}
          <ellipse cx="225" cy="335" rx="14" ry="18" fill="#1e1b4b" />
          {/* Arms reaching forward to keyboard */}
          <path d="M 218,335 Q 212,330 205,327" stroke="#1e1b4b" strokeWidth="6" strokeLinecap="round" />
          {/* Head & Brown Hair */}
          <circle cx="227" cy="308" r="11" fill="#451a03" />
          <circle cx="224" cy="309" r="8" fill="#fed7aa" />
          <path d="M 218,304 Q 225,298 234,305 Q 228,316 218,304" fill="#451a03" />

          {/* Glowing Headphones */}
          <path d="M 221,304 Q 226,298 232,304" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
          <rect x="220" y="304" width="3.5" height="7" rx="1" fill="#38bdf8" />
          <rect x="231" y="304" width="3.5" height="7" rx="1" fill="#38bdf8" />
        </g>

        {/* ─── 4. WOOD STOVE / FIREPLACE WITH ANIMATED FIRE ───────────── */}
        <g id="woodStove" onClick={onToggleFire} className="cursor-pointer">
          {/* Stove Pipe Chimney */}
          <rect x="140" y="160" width="14" height="170" fill="#1e293b" />
          <rect x="138" y="155" width="18" height="6" fill="#0f172a" />
          <path d="M 140,240 Q 128,260 140,280" stroke="#0f172a" strokeWidth="14" fill="none" />

          {/* Cast Iron Stove Body */}
          <rect x="128" y="325" width="38" height="50" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          {/* Stove Legs */}
          <rect x="132" y="375" width="4" height="12" fill="#0f172a" />
          <rect x="158" y="375" width="4" height="12" fill="#0f172a" />

          {/* Fireplace Hearth Glass Door */}
          <rect x="136" y="338" width="22" height="26" rx="3" fill="#451a03" stroke="#94a3b8" strokeWidth="1" />

          {/* Animated Fire & Embers */}
          {fireActive ? (
            <g id="fireFlames">
              <circle cx="147" cy="351" r="28" fill="url(#fireGlow)" />
              {/* Flame shapes */}
              <motion.path
                d="M 142,358 Q 147,342 147,346 Q 147,340 152,358 Z"
                fill="#fbbf24"
                animate={{ scaleY: [1, 1.25, 0.95, 1.15, 1], y: [0, -2, 1, -1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
              />
              <motion.path
                d="M 144,358 Q 147,347 149,358 Z"
                fill="#ea580c"
                animate={{ scaleY: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
              />
              {/* Embers */}
              <motion.circle
                cx="146"
                cy="342"
                r="1"
                fill="#fef08a"
                animate={{ y: [0, -8], opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'easeOut' }}
              />
            </g>
          ) : (
            <rect x="137" y="340" width="20" height="22" rx="2" fill="#18181b" />
          )}
        </g>

        {/* ─── 5. COZY CARPET & SLEEPING CAT ──────────────────────────── */}
        {/* Persian / Boho Carpet */}
        <ellipse cx="270" cy="425" rx="50" ry="24" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        <ellipse cx="270" cy="425" rx="44" ry="20" fill="#dc2626" opacity="0.85" />
        <ellipse cx="270" cy="425" rx="32" ry="14" fill="#fef3c7" opacity="0.9" />

        {/* Sleeping Cute Ginger Cat (Curled Up with Breathing Motion) */}
        <g id="sleepingCat" onClick={onPetCat} className="cursor-pointer">
          <motion.g
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
          >
            {/* Body */}
            <ellipse cx="265" cy="422" rx="14" ry="9" fill="#ea580c" />
            <ellipse cx="265" cy="421" rx="12" ry="7" fill="#fb923c" />
            {/* Head */}
            <circle cx="277" cy="421" r="6.5" fill="#ea580c" />
            {/* Ears */}
            <polygon points="278,416 282,412 283,417" fill="#c2410c" />
            <polygon points="274,416 276,412 278,417" fill="#c2410c" />
            {/* Curled Tail */}
            <path
              d="M 252,423 Q 250,429 257,429 Q 263,428 261,424"
              stroke="#ea580c"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>
          {/* Zzz sleeping bubbles */}
          <motion.text
            x="286"
            y="414"
            fill="#e0e7ff"
            fontSize="9"
            fontWeight="bold"
            animate={{ opacity: [0, 0.9, 0], y: [0, -8] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeOut' }}
          >
            zZ
          </motion.text>
        </g>

        {/* ─── 6. BOOKSHELF & INDOOR PLANTS ───────────────────────────── */}
        {/* Wooden Bookshelf under Loft */}
        <rect x="250" y="215" width="28" height="75" fill="#451a03" stroke="#290e03" strokeWidth="2" />
        <line x1="250" y1="238" x2="278" y2="238" stroke="#78350f" strokeWidth="2.5" />
        <line x1="250" y1="262" x2="278" y2="262" stroke="#78350f" strokeWidth="2.5" />

        {/* Books on Shelves */}
        <rect x="252" y="222" width="4" height="15" fill="#3b82f6" />
        <rect x="257" y="220" width="5" height="17" fill="#ec4899" />
        <rect x="263" y="223" width="4" height="14" fill="#10b981" />
        <rect x="268" y="221" width="5" height="16" fill="#f59e0b" />

        <rect x="253" y="244" width="6" height="17" fill="#8b5cf6" />
        <rect x="260" y="246" width="5" height="15" fill="#06b6d4" />
        <rect x="266" y="243" width="7" height="18" fill="#ef4444" />

        {/* Potted Plant by the ladder */}
        <rect x="272" y="325" width="14" height="12" rx="2" fill="#78350f" />
        <circle cx="279" cy="320" r="9" fill="#10b981" />
        <circle cx="283" cy="315" r="7" fill="#059669" />
        <circle cx="274" cy="316" r="6" fill="#34d399" />

        {/* ─── 7. KITCHENETTE (RIGHT GROUND FLOOR NOOK) ───────────────── */}
        {/* Kitchen Counter Under Loft */}
        <polygon points="340,320 450,305 450,370 340,385" fill="#475569" />
        <rect x="340" y="320" width="110" height="8" fill="#e2e8f0" />
        {/* Sink & Stove Top */}
        <rect x="355" y="322" width="22" height="4" fill="#94a3b8" />
        <ellipse cx="405" cy="324" rx="10" ry="2" fill="#0f172a" />
        {/* Hanging Kitchen Utensils */}
        <line x1="395" y1="285" x2="445" y2="280" stroke="#94a3b8" strokeWidth="2" />
        <line x1="405" y1="285" x2="405" y2="300" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="420" y1="284" x2="420" y2="298" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="435" y1="282" x2="435" y2="302" stroke="#cbd5e1" strokeWidth="1.5" />
      </svg>
    </div>
  )
}
