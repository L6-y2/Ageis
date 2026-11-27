export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] lg:pr-60" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-24 lg:pb-10">
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="h-9 w-24 bg-[#12141C] rounded-[10px]" />
        <div className="h-4 w-36 bg-[#12141C] rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-pulse">
        <div className="lg:col-span-5 space-y-5">
          <div className="h-72 bg-[#12141C] border border-[rgba(236,238,242,0.07)] rounded-[14px]" />
          <div className="h-28 bg-[#12141C] border border-[rgba(236,238,242,0.07)] rounded-[14px]" />
        </div>
        <div className="lg:col-span-7 space-y-5">
          <div className="h-80 bg-[#12141C] border border-[rgba(236,238,242,0.07)] rounded-[14px]" />
          <div className="h-52 bg-[#12141C] border border-[rgba(236,238,242,0.07)] rounded-[14px]" />
        </div>
      </div>
      </div>
    </div>
  )
}
