import os

os.makedirs('C:/Users/yasmien/Desktop/workflow/aegis-app/public/avatars', exist_ok=True)

u1 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="36" fill="url(#u1_bg)"/>
  <circle cx="60" cy="46" r="22" fill="#FED7AA"/>
  <path d="M38 42C38 30 48 24 60 24C72 24 82 30 82 42C82 44 80 46 76 43C72 40 68 40 60 40C52 40 48 40 44 43C40 46 38 44 38 42Z" fill="#1E293B"/>
  <path d="M28 104C28 84 42 76 60 76C78 76 92 84 92 104" fill="#3B82F6"/>
  <path d="M50 76L60 92L70 76" fill="#F8FAFC"/>
  <defs>
    <linearGradient id="u1_bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1E3A8A"/>
      <stop offset="1" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
</svg>'''

u2 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="36" fill="url(#u2_bg)"/>
  <circle cx="60" cy="46" r="22" fill="#FDE68A"/>
  <path d="M36 40C36 28 46 22 60 22C74 22 84 28 84 40" fill="#0F172A"/>
  <rect x="44" y="42" width="32" height="10" rx="4" fill="#10B981" fill-opacity="0.9"/>
  <path d="M26 104C26 84 40 76 60 76C80 76 94 84 94 104" fill="#10B981"/>
  <path d="M54 84L48 90L54 96M66 84L72 90L66 96" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <defs>
    <linearGradient id="u2_bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="#064E3B"/>
      <stop offset="1" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
</svg>'''

u3 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="36" fill="url(#u3_bg)"/>
  <circle cx="60" cy="48" r="22" fill="#FECDD3"/>
  <path d="M24 38L60 22L96 38L60 54L24 38Z" fill="#6366F1"/>
  <path d="M88 43V60" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
  <circle cx="88" cy="62" r="2.5" fill="#F59E0B"/>
  <path d="M28 104C28 84 42 78 60 78C78 78 92 84 92 104" fill="#4F46E5"/>
  <defs>
    <linearGradient id="u3_bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="#312E81"/>
      <stop offset="1" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
</svg>'''

u4 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="36" fill="url(#u4_bg)"/>
  <circle cx="60" cy="46" r="22" fill="#FFEDD5"/>
  <path d="M40 28C45 22 55 20 60 20C65 20 75 22 80 28" stroke="#EA580C" stroke-width="5" stroke-linecap="round"/>
  <path d="M26 104C26 84 40 76 60 76C80 76 94 84 94 104" fill="#EA580C"/>
  <path d="M60 82L63 88L70 89L65 94L66 101L60 98L54 101L55 94L50 89L57 88L60 82Z" fill="#FDE047"/>
  <defs>
    <linearGradient id="u4_bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C2D12"/>
      <stop offset="1" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
</svg>'''

a1 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="36" fill="url(#a1_bg)"/>
  <path d="M60 18L90 32V60C90 78 77 94 60 102C43 94 30 78 30 60V32L60 18Z" fill="url(#a1_shield)" stroke="#F59E0B" stroke-width="3"/>
  <path d="M60 36L68 52L86 54L72 66L76 84L60 74L44 84L48 66L34 54L52 52L60 36Z" fill="#FDE68A"/>
  <circle cx="60" cy="60" r="8" fill="#D97706"/>
  <defs>
    <linearGradient id="a1_bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="#451A03"/>
      <stop offset="1" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="a1_shield" x1="30" y1="18" x2="90" y2="102" gradientUnits="userSpaceOnUse">
      <stop stop-color="#B45309"/>
      <stop offset="1" stop-color="#78350F"/>
    </linearGradient>
  </defs>
</svg>'''

a2 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="36" fill="url(#a2_bg)"/>
  <circle cx="60" cy="60" r="38" stroke="#10B981" stroke-width="3" stroke-dasharray="6 4"/>
  <circle cx="60" cy="60" r="26" fill="url(#a2_core)" stroke="#34D399" stroke-width="2"/>
  <circle cx="60" cy="60" r="12" fill="#ECFDF5"/>
  <path d="M60 28V36M60 84V92M28 60H36M84 60H92" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
  <defs>
    <linearGradient id="a2_bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="#064E3B"/>
      <stop offset="1" stop-color="#022C22"/>
    </linearGradient>
    <linearGradient id="a2_core" x1="34" y1="34" x2="86" y2="86" gradientUnits="userSpaceOnUse">
      <stop stop-color="#059669"/>
      <stop offset="1" stop-color="#047857"/>
    </linearGradient>
  </defs>
</svg>'''

a3 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="36" fill="url(#a3_bg)"/>
  <rect x="32" y="34" width="56" height="48" rx="16" fill="url(#a3_head)" stroke="#38BDF8" stroke-width="2.5"/>
  <rect x="44" y="50" width="10" height="12" rx="5" fill="#38BDF8"/>
  <rect x="66" y="50" width="10" height="12" rx="5" fill="#38BDF8"/>
  <path d="M52 70C56 73 64 73 68 70" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="24" r="4" fill="#38BDF8"/>
  <path d="M60 28V34" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
  <defs>
    <linearGradient id="a3_bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0C4A6E"/>
      <stop offset="1" stop-color="#082F49"/>
    </linearGradient>
    <linearGradient id="a3_head" x1="32" y1="34" x2="88" y2="82" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0284C7"/>
      <stop offset="1" stop-color="#0369A1"/>
    </linearGradient>
  </defs>
</svg>'''

with open('C:/Users/yasmien/Desktop/workflow/aegis-app/public/avatars/user-1.svg', 'w', encoding='utf-8') as f: f.write(u1)
with open('C:/Users/yasmien/Desktop/workflow/aegis-app/public/avatars/user-2.svg', 'w', encoding='utf-8') as f: f.write(u2)
with open('C:/Users/yasmien/Desktop/workflow/aegis-app/public/avatars/user-3.svg', 'w', encoding='utf-8') as f: f.write(u3)
with open('C:/Users/yasmien/Desktop/workflow/aegis-app/public/avatars/user-4.svg', 'w', encoding='utf-8') as f: f.write(u4)
with open('C:/Users/yasmien/Desktop/workflow/aegis-app/public/avatars/aegis-1.svg', 'w', encoding='utf-8') as f: f.write(a1)
with open('C:/Users/yasmien/Desktop/workflow/aegis-app/public/avatars/aegis-2.svg', 'w', encoding='utf-8') as f: f.write(a2)
with open('C:/Users/yasmien/Desktop/workflow/aegis-app/public/avatars/aegis-3.svg', 'w', encoding='utf-8') as f: f.write(a3)

print('AVATARS CREATED SUCCESSFULLY!')
