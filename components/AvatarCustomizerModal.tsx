'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  Check,
  User,
  Shield,
  Camera,
} from 'lucide-react'
import {
  useAvatars,
  USER_AVATAR_PRESETS,
  AEGIS_AVATAR_PRESETS,
  AvatarPreset,
} from '@/lib/useAvatars'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'user' | 'aegis'
}

export default function AvatarCustomizerModal({
  isOpen,
  onClose,
  initialTab = 'user',
}: Props) {
  const { userAvatar, aegisAvatar, setUserAvatar, setAegisAvatar } = useAvatars()
  const [activeTab, setActiveTab] = useState<'user' | 'aegis'>(initialTab)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP).')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 3 ميجابايت.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (activeTab === 'user') {
        setUserAvatar(result)
        triggerToast('تم تحديث صورتك الشخصية بنجاح')
      } else {
        setAegisAvatar(result)
        triggerToast('تم تحديث صورة ومجسم إيجيس بنجاح')
      }
    }
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[rgba(6,7,10,0.82)] backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-modal-title"
          className="w-full max-w-lg bg-[#191C25] border border-[rgba(236,238,242,0.14)] rounded-t-[18px] sm:rounded-[16px] p-5 sm:p-6 shadow-[0_20px_48px_-8px_rgba(0,0,0,0.8)] relative overflow-hidden"
          dir="rtl"
        >
          <div className="sm:hidden w-10 h-1 rounded-full bg-[rgba(236,238,242,0.18)] mx-auto mb-3" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(236,238,242,0.08)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-[rgba(212,175,55,0.10)] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
                <Camera size={18} />
              </div>
              <h2 id="avatar-modal-title" className="text-base font-bold text-[#ECEEF2]">
                تخصيص الهوية البصرية
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق النافذة"
              className="w-9 h-9 rounded-[10px] bg-[#12141C] border border-[rgba(236,238,242,0.10)] text-[#9CA3AF] hover:text-[#ECEEF2] flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Toast Notification */}
          {toastMsg && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-3.5 py-2.5 rounded-[10px] bg-[rgba(78,168,126,0.12)] border border-[rgba(78,168,126,0.32)] text-[#4EA87E] text-xs font-semibold flex items-center gap-2"
            >
              <Check size={14} />
              <span>{toastMsg}</span>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1.5 mt-4 p-1 bg-[#07080B] rounded-[10px] border border-[rgba(236,238,242,0.07)]">
            <button
              type="button"
              onClick={() => setActiveTab('user')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[8px] text-xs font-semibold transition-colors min-h-[40px] border ${
                activeTab === 'user'
                  ? 'bg-[#191C25] border-[rgba(212,175,55,0.35)] text-[#ECEEF2]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#ECEEF2]'
              }`}
            >
              <User size={15} className={activeTab === 'user' ? 'text-[#D4AF37]' : ''} />
              <span>صورتي الشخصية</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('aegis')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[8px] text-xs font-semibold transition-colors min-h-[40px] border ${
                activeTab === 'aegis'
                  ? 'bg-[#191C25] border-[rgba(212,175,55,0.35)] text-[#ECEEF2]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#ECEEF2]'
              }`}
            >
              <Shield size={15} className={activeTab === 'aegis' ? 'text-[#D4AF37]' : ''} />
              <span>مجسم إيجيس</span>
            </button>
          </div>

          {/* Current Avatar Showcase */}
          <div className="my-5 flex items-center gap-4 p-4 rounded-[12px] bg-[#07080B] border border-[rgba(236,238,242,0.08)]">
            <div className="relative w-16 h-16 rounded-[12px] overflow-hidden border border-[rgba(212,175,55,0.45)] bg-[#12141C] shrink-0">
              <img
                src={activeTab === 'user' ? userAvatar : aegisAvatar}
                alt="الصورة الحالية"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-[#7D8594] block">الصورة المُفعلة حالياً:</span>
              <p className="text-sm font-semibold text-[#ECEEF2] mt-0.5 truncate">
                {activeTab === 'user' ? 'صورتك في الملف الشخصي والهيدر' : 'شعار ومساعدك الذكي إيجيس'}
              </p>
              <span className="text-[11px] text-[#4EA87E] font-medium">تُحدث فورياً في جميع الصفحات</span>
            </div>
          </div>

          {/* Presets Grid */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-[#9CA3AF] block">
              اختر من النماذج المعتمدة:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {(activeTab === 'user' ? USER_AVATAR_PRESETS : AEGIS_AVATAR_PRESETS).map(
                (preset: AvatarPreset) => {
                  const isSelected =
                    (activeTab === 'user' ? userAvatar : aegisAvatar) === preset.url
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        if (activeTab === 'user') {
                          setUserAvatar(preset.url)
                          triggerToast(`تم اختيار "${preset.name}"`)
                        } else {
                          setAegisAvatar(preset.url)
                          triggerToast(`تم اختيار "${preset.name}"`)
                        }
                      }}
                      className={`relative flex flex-col items-center p-2 rounded-[10px] border transition-colors ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.10)]'
                          : 'border-[rgba(236,238,242,0.08)] bg-[#12141C] hover:border-[rgba(236,238,242,0.20)]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-[#07080B] mb-1.5">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] font-medium text-[#ECEEF2] text-center truncate w-full">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#D4AF37] text-[#0A0B0E] flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  )
                }
              )}
            </div>
          </div>

          {/* Upload Custom Image Button */}
          <div className="mt-5 pt-4 border-t border-[rgba(236,238,242,0.08)]">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-[10px] bg-[#12141C] hover:bg-[#202430] border border-[rgba(236,238,242,0.12)] text-[#ECEEF2] text-xs font-semibold flex items-center justify-center gap-2 transition-colors min-h-[44px]"
            >
              <Upload size={15} className="text-[#D4AF37]" />
              <span>
                {activeTab === 'user'
                  ? 'رفع صورة خاصة بك من جهازك (PNG / JPG / WebP)'
                  : 'رفع صورة مخصصة لمجسم إيجيس من جهازك'}
              </span>
            </button>
          </div>

          {/* Footer close button */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-[10px] bg-[#D4AF37] hover:bg-[#E0C058] text-[#0A0B0E] text-xs font-semibold transition-colors min-h-[42px]"
            >
              تم وحفظ
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
