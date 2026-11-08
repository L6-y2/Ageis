import BottomNav from '@/components/BottomNav'
import FocusTimer from '@/components/FocusTimer'
import { Timer, ArrowRight, Sparkles, Shield, Flame, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function FocusPage() {
  return (
    <main className="min-h-screen pb-28 pt-6 px-4 sm:px-6">
      {/* ─── Top Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-800"
        >
          <ArrowRight size={15} />
          <span>الرئيسية</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-300">محراب التركيز العميق</span>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Title & Description */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>استوديو التركيز واللوفاي</span>
            <span className="text-xl">☕</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            مساحة كوزي هادئة للمذاكرة مع أصوات المطر والمدفأة وموسيقى اللوفاي
          </p>
        </div>

        {/* ─── Main Instrument Chronometer & Cozy Studio Panel ────────────── */}
        <FocusTimer />

        {/* ─── Productivity Tips & XP Guidelines ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <h4 className="text-xs font-bold text-white">صفر مشتتات</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              فعّل وضع الهدوء (Zen Mode) لملء الشاشة بقرص التوقيت فقط.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
