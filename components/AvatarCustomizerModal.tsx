'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  Check,
  User,
  Shield,
  Sparkles,
  Camera,
  Image as ImageIcon,
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
        triggerToast('✅ تم تحديث صورتك الشخصية بنجاح!')
      } else {
        setAegisAvatar(result)
        triggerToast('✅ تم تحديث صورة ومجسم إيجيس بنجاح!')
      }
    }
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-[#141922] border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Camera size={20} className="text-emerald-400" />
              <h2 className="text-base sm:text-lg font-black text-white">
                تخصيص الصور والمظهر
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Toast Notification */}
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2"
            >
              <Check size={14} />
              <span>{toastMsg}</span>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-900/80 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'user'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={15} />
              <span>صورتي الشخصية</span>
            </button>
            <button
              onClick={() => setActiveTab('aegis')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'aegis'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield size={15} />
              <span>مجسم إيجيس</span>
            </button>
          </div>

          {/* Current Avatar Showcase */}
          <div className="my-5 flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-lg bg-[#0e1217] flex-shrink-0">
              <img
                src={activeTab === 'user' ? userAvatar : aegisAvatar}
                alt="Active Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <span className="text-[11px] text-slate-400 block">الصورة الحالية المُفعلة:</span>
              <p className="text-sm font-bold text-white mt-0.5">
                {activeTab === 'user' ? 'صورتك في الملف الشخصي والهيدر' : 'شعار ومساعدك الذكي إيجيس'}
              </p>
              <span className="text-[10px] text-emerald-400 font-medium">مُحدثة فورياً في كل الصفحات</span>
            </div>
          </div>

          {/* Presets Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 block">
              اختر من النماذج الجاهزة:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {(activeTab === 'user' ? USER_AVATAR_PRESETS : AEGIS_AVATAR_PRESETS).map(
                (preset: AvatarPreset) => {
                  const isSelected =
                    (activeTab === 'user' ? userAvatar : aegisAvatar) === preset.url
                  return (
                    <button
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
                      className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 shadow-md shadow-emerald-500/20'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0e1217] mb-1">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 text-center truncate w-full">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-black">
                          ✓
                        </span>
                      )}
                    </button>
                  )
                }
              )}
            </div>
          </div>

          {/* Upload Custom Image Button */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Upload size={15} className="text-emerald-400" />
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
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              تم وحفظ
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
