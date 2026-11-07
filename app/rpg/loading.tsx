export default function RpgLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 pb-20" dir="rtl">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 animate-pulse">
        <div className="h-7 w-36 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-52 bg-white/5 rounded-lg" />
      </div>

      {/* Level card */}
      <div className="px-4 mb-4 animate-pulse">
        <div className="h-28 bg-white/5 rounded-2xl" />
      </div>

      {/* Badges grid skeleton */}
      <div className="px-4 animate-pulse">
        <div className="h-5 w-28 bg-white/10 rounded-lg mb-3" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
