import BottomNav from '@/components/BottomNav'
import FocusTimer from '@/components/FocusTimer'
import { ArrowRight, Sparkles, Brain, Clock, Shield } from 'lucide-react'
import Link from 'next/link'

export default function FocusPage() {
  return (
    <main className="min-h-screen pb-24 pt-4 px-2 sm:px-4 lg:px-6">
      {/* ─── Sleek Top Bar ────────────────────────────────────────────── */}
      <div className="max-w-[1700px] mx-auto flex items-center justify-between mb-3 px-2 sm:px-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-800 shadow-sm"
        >
          <ArrowRight size={15} />
          <span>الرئيسية</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span className="text-xs font-bold text-pink-300">محراب التركيز واللوفاي ☕</span>
        </div>
      </div>

      {/* ─── Studio Full Bleed Expansion (Fills the whole page) ─────────── */}
      <div className="w-full max-w-[1700px] mx-auto mb-6">
        <FocusTimer />
      </div>

      {/* ─── Productivity Tips & Guidelines ─────────────────────────────── */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 px-2">
        <div className="panel p-3.5 space-y-1 text-center">
          <span className="text-xl">⏱️</span>
          <h4 className="text-xs font-bold text-white">منهجية Pomodoro</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            25 دقيقة تركيز تام يعقبها 5 دقائق استراحة لتجديد النشاط الذهني.
          </p>
        </div>

        <div className="panel p-3.5 space-y-1 text-center">
          <span className="text-xl">⚡</span>
          <h4 className="text-xs font-bold text-white">مكافآت الـ XP</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            كل دقيقة تركيز تحتسب لك نقاط خبرة ترفع رتبتك في مسار الـ RPG.
          </p>
        </div>

        <div className="panel p-3.5 space-y-1 text-center">
          <span className="text-xl">🔕</span>
          <h4 className="text-xs font-bold text-white">ملء الشاشة بالكامل</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            اضغط على أيقونة التكبير لملء شاشتك بالكامل باستوديو اللوفاي بدون مشتتات.
          </p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
