'use client'

import { useState, useEffect } from 'react'

export const DEFAULT_USER_AVATAR = '/avatars/user-1.svg'
export const DEFAULT_AEGIS_AVATAR = '/aegis-avatar.jpg'

export interface AvatarPreset {
  id: string
  name: string
  url: string
  badge: string
}

export const USER_AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'u1', name: 'طالب طموح', url: '/avatars/user-1.svg', badge: 'أزرق ملكي' },
  { id: 'u2', name: 'مبرمج المستقبل', url: '/avatars/user-2.svg', badge: 'كود وزمرد' },
  { id: 'u3', name: 'باحث أكاديمي', url: '/avatars/user-3.svg', badge: 'حكمة وبنفسج' },
  { id: 'u4', name: 'بطل التركيز', url: '/avatars/user-4.svg', badge: 'شعلة وحماس' },
]

export const AEGIS_AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'a0', name: 'درع الحارس الأسطوري', url: '/aegis-avatar.jpg', badge: 'HD رسمي' },
  { id: 'a_svg', name: 'الدرع النقي Vector', url: '/aegis-avatar.svg', badge: 'SVG' },
  { id: 'a1', name: 'صقر المعرفة الذهبي', url: '/avatars/aegis-1.svg', badge: 'درع ملكي' },
  { id: 'a2', name: 'نواة التركيز السيبرانية', url: '/avatars/aegis-2.svg', badge: 'طاقة خضراء' },
  { id: 'a3', name: 'المساعد الأكاديمي الذكي', url: '/avatars/aegis-3.svg', badge: 'رفيق آلي' },
]

export function useAvatars() {
  const [userAvatar, setUserAvatarState] = useState<string>(DEFAULT_USER_AVATAR)
  const [aegisAvatar, setAegisAvatarState] = useState<string>(DEFAULT_AEGIS_AVATAR)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedUser = localStorage.getItem('aegis_user_avatar')
    const savedAegis = localStorage.getItem('aegis_mascot_avatar')

    if (savedUser) setUserAvatarState(savedUser)
    if (savedAegis) setAegisAvatarState(savedAegis)

    const handleUpdate = () => {
      const u = localStorage.getItem('aegis_user_avatar')
      const a = localStorage.getItem('aegis_mascot_avatar')
      if (u) setUserAvatarState(u)
      if (a) setAegisAvatarState(a)
    }

    window.addEventListener('aegis_avatar_update', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('aegis_avatar_update', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const setUserAvatar = (url: string) => {
    setUserAvatarState(url)
    localStorage.setItem('aegis_user_avatar', url)
    window.dispatchEvent(new Event('aegis_avatar_update'))
  }

  const setAegisAvatar = (url: string) => {
    setAegisAvatarState(url)
    localStorage.setItem('aegis_mascot_avatar', url)
    window.dispatchEvent(new Event('aegis_avatar_update'))
  }

  return {
    userAvatar: mounted ? userAvatar : DEFAULT_USER_AVATAR,
    aegisAvatar: mounted ? aegisAvatar : DEFAULT_AEGIS_AVATAR,
    setUserAvatar,
    setAegisAvatar,
    mounted,
  }
}
