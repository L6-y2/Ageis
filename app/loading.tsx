export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col pb-20">
      {/* Header skeleton */}
      <div className="px-4 pt-8 pb-4 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-48 bg-white/5 rounded-lg" />
      </div>

      {/* Stats row skeleton */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-2xl" />
        ))}
      </div>

      {/* XP bar skeleton */}
      <div className="px-4 mb-4 animate-pulse">
        <div className="h-16 bg-white/5 rounded-2xl" />
      </div>

      {/* Cards skeleton */}
      <div className="px-4 space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
