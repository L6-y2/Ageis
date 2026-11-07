export default function CurriculumLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 pb-20" dir="rtl">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 animate-pulse">
        <div className="h-7 w-40 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-56 bg-white/5 rounded-lg" />
      </div>

      {/* Subject cards skeleton */}
      <div className="px-4 space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
