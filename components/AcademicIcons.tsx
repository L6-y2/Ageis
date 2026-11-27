'use client'

import {
  BookOpen,
  Code2,
  Globe2,
  Landmark,
  Shield,
  GraduationCap,
  Swords,
  Zap,
  Crown,
  Sparkles,
  Award,
} from 'lucide-react'

export interface SubjectVisualTheme {
  id: number
  text: string
  bgSubtle: string
  border: string
  barBg: string
  Icon: typeof BookOpen
}

export const SUBJECT_THEMES: Record<number, SubjectVisualTheme> = {
  6: {
    id: 6,
    text: 'text-[#4EA87E]',
    bgSubtle: 'bg-[rgba(78,168,126,0.10)]',
    border: 'border-[rgba(78,168,126,0.30)]',
    barBg: 'bg-[#4EA87E]',
    Icon: BookOpen,
  },
  7: {
    id: 7,
    text: 'text-[#5D8AA8]',
    bgSubtle: 'bg-[rgba(93,138,168,0.10)]',
    border: 'border-[rgba(93,138,168,0.30)]',
    barBg: 'bg-[#5D8AA8]',
    Icon: Code2,
  },
  8: {
    id: 8,
    text: 'text-[#937CB8]',
    bgSubtle: 'bg-[rgba(147,124,184,0.10)]',
    border: 'border-[rgba(147,124,184,0.30)]',
    barBg: 'bg-[#937CB8]',
    Icon: Globe2,
  },
  9: {
    id: 9,
    text: 'text-[#D4AF37]',
    bgSubtle: 'bg-[rgba(212,175,55,0.10)]',
    border: 'border-[rgba(212,175,55,0.32)]',
    barBg: 'bg-[#D4AF37]',
    Icon: Landmark,
  },
}

export function getSubjectTheme(subjectId: number): SubjectVisualTheme {
  return SUBJECT_THEMES[subjectId] || SUBJECT_THEMES[6]
}

export function SubjectIcon({
  subjectId,
  size = 18,
  className = '',
}: {
  subjectId: number
  size?: number
  className?: string
}) {
  const theme = getSubjectTheme(subjectId)
  const Icon = theme.Icon
  return <Icon size={size} strokeWidth={1.75} className={`${theme.text} ${className}`} />
}

export function RankIcon({
  level,
  size = 18,
  className = 'text-[#D4AF37]',
}: {
  level: number
  size?: number
  className?: string
}) {
  if (level >= 6) return <Crown size={size} strokeWidth={1.75} className={className} />
  if (level === 5) return <Sparkles size={size} strokeWidth={1.75} className={className} />
  if (level === 4) return <Zap size={size} strokeWidth={1.75} className={className} />
  if (level === 3) return <Swords size={size} strokeWidth={1.75} className={className} />
  if (level === 2) return <GraduationCap size={size} strokeWidth={1.75} className={className} />
  if (level === 1) return <Shield size={size} strokeWidth={1.75} className={className} />
  return <Award size={size} strokeWidth={1.75} className={className} />
}

/**
 * Strips decorative emoji symbols from legacy display strings (such as LEVEL_TITLES or badge labels)
 * so presentation surfaces remain typographically clean while keeping backend/lib contracts unchanged.
 */
export function stripPresentationEmojis(text?: string | null): string {
  if (!text) return ''
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
