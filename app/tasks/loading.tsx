export default function TasksLoading() {
  return (
    <div className="min-h-screen pb-28 pt-8 px-4 sm:px-6" dir="rtl">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10" />
          <div>
            <div className="h-6 w-32 bg-white/10 rounded-lg mb-1.5" />
            <div className="h-3.5 w-44 bg-white/5 rounded-lg" />
          </div>
        </div>
        <div className="h-9 w-28 bg-white/10 rounded-2xl" />
      </div>

      {/* Tabs skeleton */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-white/5 mb-5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 rounded-xl bg-white/5" />
        ))}
      </div>

      {/* Task cards skeleton */}
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-white/5 border border-white/5 p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-6 h-6 rounded-lg bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-white/10 rounded" />
                <div className="h-3 w-28 bg-white/5 rounded" />
              </div>
            </div>
            <div className="h-7 w-20 rounded-xl bg-white/5 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
