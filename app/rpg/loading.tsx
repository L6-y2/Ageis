export default function RpgLoading() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] lg:pr-60" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-24 lg:pb-10">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(236,238,242,0.07)] animate-pulse">
        <div className="space-y-2">
          <div className="h-6 w-40 bg-[#191C25] rounded" />
          <div className="h-3.5 w-32 bg-[#12141C] rounded" />
        </div>
      </div>

      <div className="h-44 bg-[#12141C] border border-[rgba(236,238,242,0.07)] rounded-[14px] mb-6 animate-pulse" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-[#12141C] border border-[rgba(236,238,242,0.07)] rounded-[12px]" />
        ))}
      </div>
      </div>
    </div>
  )
}
