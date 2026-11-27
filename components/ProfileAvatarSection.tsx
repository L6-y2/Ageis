'use client'

import { useState } from 'react'
import { Camera, Download, Edit3 } from 'lucide-react'
import { useAvatars } from '@/lib/useAvatars'
import AvatarCustomizerModal from './AvatarCustomizerModal'

interface Props {
  level: number
  levelTitle: string
  name: string
}

export default function ProfileAvatarSection({ level, levelTitle, name }: Props) {
  void levelTitle
  void name
  const { userAvatar, aegisAvatar } = useAvatars()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'user' | 'aegis'>('user')

  const openModal = (tab: 'user' | 'aegis') => {
    setModalTab(tab)
    setModalOpen(true)
  }

  return (
    <>
      {/* User Profile Avatar */}
      <div className="relative w-24 h-24 mx-auto mb-3 group">
        <div className="w-full h-full rounded-[18px] bg-[#07080B] border-2 border-[rgba(212,175,55,0.45)] p-1 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)]">
          <div className="w-full h-full bg-[#12141C] rounded-[13px] flex items-center justify-center overflow-hidden relative">
            <img
              src={userAvatar}
              alt="الصورة الشخصية"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => openModal('user')}
              aria-label="تغيير الصورة الشخصية"
              className="absolute inset-0 bg-[#0A0B0E]/65 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#ECEEF2] transition-opacity"
              title="تغيير صورتك"
            >
              <Camera size={20} className="text-[#D4AF37]" />
            </button>
          </div>
        </div>
        <span
          dir="ltr"
          className="absolute -bottom-2 inset-x-0 mx-auto w-fit px-2.5 py-0.5 rounded-[6px] bg-[#191C25] border border-[rgba(212,175,55,0.45)] text-[10px] font-bold font-tabular text-[#D4AF37]"
        >
          LVL {level}
        </span>
      </div>

      <div className="flex justify-center mt-4 mb-2">
        <button
          type="button"
          onClick={() => openModal('user')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#12141C] hover:bg-[#202430] text-[#9CA3AF] hover:text-[#ECEEF2] text-xs font-semibold transition-colors border border-[rgba(236,238,242,0.12)] min-h-[38px]"
        >
          <Camera size={14} className="text-[#D4AF37]" />
          <span>تغيير صورتي</span>
        </button>
      </div>

      {/* Aegis Mascot Showcase Card */}
      <div className="rounded-[12px] p-4 bg-[#12141C] border border-[rgba(236,238,242,0.08)] mt-5 text-right">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-[10px] bg-[#07080B] border border-[rgba(212,175,55,0.28)] p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={aegisAvatar}
              alt="شعار إيجيس"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-[#ECEEF2]">درع ومجسم إيجيس</h3>
              <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-medium bg-[rgba(212,175,55,0.10)] text-[#D4AF37] border border-[rgba(212,175,55,0.25)]">
                مُخصص
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed">
              شعار المساعد الأكاديمي إيجيس المعتمد في المحادثات ولوحة القيادة.
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-[rgba(236,238,242,0.07)] flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openModal('aegis')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#191C25] hover:bg-[#202430] border border-[rgba(212,175,55,0.32)] text-[#ECEEF2] text-xs font-semibold transition-colors min-h-[38px]"
          >
            <Edit3 size={13} className="text-[#D4AF37]" />
            <span>تخصيص المجسم</span>
          </button>

          <a
            href="/aegis-avatar.jpg"
            download="aegis-avatar.jpg"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#07080B] hover:bg-[#191C25] border border-[rgba(236,238,242,0.10)] text-[#9CA3AF] hover:text-[#ECEEF2] text-xs font-medium transition-colors min-h-[38px]"
          >
            <Download size={13} />
            <span>تحميل الأصل</span>
          </a>
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
