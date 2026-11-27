export default function CurriculumLoading() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] lg:pr-60" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-24 lg:pb-10">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(236,238,242,0.07)] animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] bg-[#12141C]" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-[#191C25] rounded" />
            <div className="h-3.5 w-52 bg-[#12141C] rounded" />
          </div>
        </div>
        <div className="h-11 w-24 bg-[#12141C] rounded-[10px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-[#12141C] border border-[rgba(236,238,242,0.07)] rounded-[14px]" />
        ))}
      </div>
      </div>
    </div>
  )
}
