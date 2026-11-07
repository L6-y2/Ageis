export default function FocusLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center pb-20" dir="rtl">
      {/* Timer circle skeleton */}
      <div className="animate-pulse flex flex-col items-center gap-6">
        <div className="w-56 h-56 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center">
          <div className="h-14 w-32 bg-white/10 rounded-xl" />
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5" />
          <div className="w-20 h-20 rounded-full bg-purple-500/20" />
          <div className="w-16 h-16 rounded-full bg-white/5" />
        </div>

        {/* Subject selector */}
        <div className="h-12 w-64 bg-white/5 rounded-xl" />
      </div>
    </div>
  )
}
