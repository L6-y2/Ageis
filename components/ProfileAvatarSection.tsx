'use client'

import { useState } from 'react'
import { Camera, Shield, Download, Sparkles, Edit3 } from 'lucide-react'
import { useAvatars } from '@/lib/useAvatars'
import AvatarCustomizerModal from './AvatarCustomizerModal'

interface Props {
  level: number
  levelTitle: string
  name: string
}

export default function ProfileAvatarSection({ level, levelTitle, name }: Props) {
  const { userAvatar, aegisAvatar } = useAvatars()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'user' | 'aegis'>('user')

  const openModal = (tab: 'user' | 'aegis') => {
    setModalTab(tab)
    setModalOpen(true)
  }

  return (
    <>
      {/* ─── User Profile Avatar Card ─────────────────────────────────────── */}
      <div className="relative w-24 h-24 mx-auto mb-4 group">
        <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-1 shadow-xl shadow-emerald-500/20">
          <div className="w-full h-full bg-[#0e1217] rounded-[22px] flex items-center justify-center overflow-hidden relative">
            <img
              src={userAvatar}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
            {/* Quick edit overlay */}
            <button
              onClick={() => openModal('user')}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              title="تغيير صورتك"
            >
              <Camera size={20} className="text-emerald-300" />
            </button>
          </div>
        </div>
        <span className="absolute -bottom-2 inset-x-0 mx-auto w-fit px-2.5 py-0.5 rounded-full bg-emerald-600 border border-emerald-400/40 text-[10px] font-black text-white shadow-md">
          Lvl.{level}
        </span>
      </div>

      <div className="flex justify-center mb-2">
        <button
          onClick={() => openModal('user')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700/80"
        >
          <Camera size={13} className="text-emerald-400" />
          <span>تغيير صورتي</span>
        </button>
      </div>

      {/* ─── Aegis Mascot Showcase Card ───────────────────────────────────── */}
      <div className="glass-card rounded-3xl p-5 border border-emerald-500/30 relative overflow-hidden mt-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 p-2 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/10 overflow-hidden">
            <img
              src={aegisAvatar}
              alt="Aegis Emblem"
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-sm text-white">درع ومجسم إيجيس</h3>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                مُخصص
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              رمز درع ومساعدك الذكي إيجيس (Aegis Study Sentinel) المعتمد في الشات وكافة أرجاء المنظومة.
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => openModal('aegis')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Edit3 size={13} />
            <span>تغيير صورة إيجيس</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href="/aegis-avatar.jpg"
              download="aegis-avatar.jpg"
              target="_blank"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              <Download size={13} />
              <span>تحميل الأصل</span>
            </a>
          </div>
        </div>
      </div>

      <AvatarCustomizerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={modalTab}
      />
    </>
  )
}
