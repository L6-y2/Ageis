export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col pb-20" dir="rtl">
      {/* Avatar section skeleton */}
      <div className="flex flex-col items-center pt-10 pb-6 animate-pulse">
        <div className="w-24 h-24 rounded-full bg-white/10 mb-4" />
        <div className="h-5 w-32 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-20 bg-white/5 rounded-lg" />
      </div>

      {/* Stats skeleton */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-2xl" />
        ))}
      </div>

      {/* XP History skeleton */}
      <div className="px-4 animate-pulse">
        <div className="h-6 w-36 bg-white/10 rounded-lg mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
