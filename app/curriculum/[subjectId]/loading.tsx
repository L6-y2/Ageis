export default function SubjectLoading() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] lg:pr-60" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-24 lg:pb-10">
      <div className="h-36 bg-[#12141C] border border-[rgba(236,238,242,0.07)] rounded-[14px] mb-5 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 mb-5 animate-pulse">
        <div className="h-11 bg-[#12141C] rounded-[10px]" />
        <div className="h-11 bg-[#12141C] rounded-[10px]" />
      </div>
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-[#12141C] border border-[rgba(236,238,242,0.07)] rounded-[12px]" />
        ))}
      </div>
      </div>
    </div>
  )
}
